import "server-only";

import { createAdminClient } from "@/utils/supabase/admin";
import { AiProviderError, generateAiResponse } from "./openai";
import { routeWorker } from "./workers";
import type { AiChatInput, AiContactInput, AiConversationMessage } from "./types";

export class AiServiceError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, message: string, status = 500) {
    super(message);
    this.name = "AiServiceError";
    this.code = code;
    this.status = status;
  }
}

export async function handleAiChat(input: AiChatInput) {
  const admin = createAdminClient();
  const channel = input.channel ?? "api";
  const conversation = await resolveConversation(admin, {
    conversationId: input.conversationId,
    channel,
    externalThreadId: input.externalThreadId,
  });

  await ensureLead(admin, conversation.id);
  if (input.contact) {
    await updateLead(admin, conversation.id, input.contact);
  }

  const { error: inboundError } = await admin.from("ai_messages").insert({
    conversation_id: conversation.id,
    direction: "inbound",
    sender_type: "candidate",
    content: input.message,
    metadata: { channel },
  });

  if (inboundError) {
    throw new AiServiceError("message_store_failed", "Could not store the incoming message.");
  }

  const worker = routeWorker(input.message);

  const { error: updateError } = await admin
    .from("ai_conversations")
    .update({
      current_worker: worker.key,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversation.id);

  if (updateError) {
    throw new AiServiceError("conversation_update_failed", "Could not update the conversation.");
  }

  if (worker.key === "human_handoff") {
    await createHumanHandoff(admin, conversation.id, input.message);
  }

  const history = await loadHistory(admin, conversation.id);
  const startedAt = Date.now();

  try {
    const result = await generateAiResponse(worker, history);
    const durationMs = Date.now() - startedAt;

    const { error: outboundError } = await admin.from("ai_messages").insert({
      conversation_id: conversation.id,
      direction: "outbound",
      sender_type: "ai",
      worker_key: worker.key,
      content: result.text,
      openai_response_id: result.responseId,
      metadata: { model: worker.model },
    });

    if (outboundError) {
      throw new AiServiceError("message_store_failed", "Could not store the AI response.");
    }

    await admin.from("ai_worker_runs").insert({
      conversation_id: conversation.id,
      worker_key: worker.key,
      model: worker.model,
      openai_response_id: result.responseId,
      status: "success",
      input_tokens: result.inputTokens ?? null,
      output_tokens: result.outputTokens ?? null,
      duration_ms: durationMs,
    });

    return {
      conversationId: conversation.id,
      worker: worker.key,
      workerLabel: worker.label,
      reply: result.text,
    };
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const errorCode =
      error instanceof AiProviderError || error instanceof AiServiceError
        ? error.code
        : "ai_unknown_error";

    await admin.from("ai_worker_runs").insert({
      conversation_id: conversation.id,
      worker_key: worker.key,
      model: worker.model,
      status: "error",
      duration_ms: durationMs,
      error_code: errorCode,
    });

    throw error;
  }
}

type AdminClient = ReturnType<typeof createAdminClient>;

async function resolveConversation(
  admin: AdminClient,
  input: { conversationId?: string; channel: string; externalThreadId?: string }
) {
  if (input.conversationId) {
    const { data, error } = await admin
      .from("ai_conversations")
      .select("id, status")
      .eq("id", input.conversationId)
      .maybeSingle();

    if (error) {
      throw new AiServiceError("conversation_lookup_failed", "Could not load the conversation.");
    }
    if (!data) {
      throw new AiServiceError("conversation_not_found", "Conversation not found.", 404);
    }
    return data;
  }

  if (input.externalThreadId) {
    const { data, error } = await admin
      .from("ai_conversations")
      .select("id, status")
      .eq("channel", input.channel)
      .eq("external_thread_id", input.externalThreadId)
      .maybeSingle();

    if (error) {
      throw new AiServiceError("conversation_lookup_failed", "Could not load the conversation.");
    }
    if (data) return data;
  }

  const { data, error } = await admin
    .from("ai_conversations")
    .insert({
      channel: input.channel,
      external_thread_id: input.externalThreadId ?? null,
      current_worker: "faith_reception",
      status: "open",
    })
    .select("id, status")
    .single();

  if (error || !data) {
    throw new AiServiceError("conversation_create_failed", "Could not create the conversation.");
  }

  return data;
}

async function loadHistory(admin: AdminClient, conversationId: string): Promise<AiConversationMessage[]> {
  const { data, error } = await admin
    .from("ai_messages")
    .select("direction, content")
    .eq("conversation_id", conversationId)
    .in("direction", ["inbound", "outbound"])
    .order("created_at", { ascending: false })
    .limit(12);

  if (error) {
    throw new AiServiceError("history_load_failed", "Could not load conversation history.");
  }

  return (data ?? [])
    .reverse()
    .map((message) => ({
      role: message.direction === "outbound" ? "assistant" : "user",
      content: message.content,
    }));
}

async function ensureLead(admin: AdminClient, conversationId: string) {
  const { error } = await admin.from("ai_leads").upsert(
    {
      conversation_id: conversationId,
      stage: "new",
      qualification_score: 0,
    },
    { onConflict: "conversation_id", ignoreDuplicates: true }
  );

  if (error) {
    throw new AiServiceError("lead_create_failed", "Could not initialize the lead record.");
  }
}

async function updateLead(admin: AdminClient, conversationId: string, contact: AiContactInput) {
  const { data: current, error: readError } = await admin
    .from("ai_leads")
    .select("full_name, phone, email, job_interest, country_interest, stage, consent_to_contact")
    .eq("conversation_id", conversationId)
    .single();

  if (readError || !current) {
    throw new AiServiceError("lead_lookup_failed", "Could not load the lead record.");
  }

  const merged = {
    fullName: clean(contact.fullName) ?? current.full_name,
    phone: clean(contact.phone) ?? current.phone,
    email: clean(contact.email)?.toLowerCase() ?? current.email,
    jobInterest: clean(contact.jobInterest) ?? current.job_interest,
    countryInterest: clean(contact.countryInterest) ?? current.country_interest,
  };

  const score = [merged.fullName, merged.phone, merged.email, merged.jobInterest, merged.countryInterest]
    .filter(Boolean).length * 20;
  const protectedStages = new Set(["handoff", "converted", "disqualified"]);
  const stage = protectedStages.has(current.stage)
    ? current.stage
    : score === 100
      ? "qualified"
      : score > 0
        ? "qualifying"
        : "new";

  const { error } = await admin
    .from("ai_leads")
    .update({
      full_name: merged.fullName,
      phone: merged.phone,
      email: merged.email,
      job_interest: merged.jobInterest,
      country_interest: merged.countryInterest,
      qualification_score: score,
      stage,
      consent_to_contact: contact.consentToContact ?? current.consent_to_contact,
      updated_at: new Date().toISOString(),
    })
    .eq("conversation_id", conversationId);

  if (error) {
    throw new AiServiceError("lead_update_failed", "Could not update the lead record.");
  }
}

async function createHumanHandoff(admin: AdminClient, conversationId: string, message: string) {
  const { data: existing, error: readError } = await admin
    .from("ai_handoffs")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  if (readError) {
    throw new AiServiceError("handoff_lookup_failed", "Could not check the handoff queue.");
  }

  if (!existing) {
    const { error } = await admin.from("ai_handoffs").insert({
      conversation_id: conversationId,
      reason: message.slice(0, 1000),
      status: "pending",
    });
    if (error) {
      throw new AiServiceError("handoff_create_failed", "Could not create the staff handoff.");
    }
  }

  await admin
    .from("ai_conversations")
    .update({ status: "handed_off", updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  await admin
    .from("ai_leads")
    .update({ stage: "handoff", updated_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .in("stage", ["new", "qualifying", "qualified", "ready"]);
}

function clean(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized.slice(0, 500) : undefined;
}
