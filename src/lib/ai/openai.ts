import "server-only";

import type { AiConversationMessage, AiProviderResult, AiWorkerDefinition } from "./types";

type RawResponse = {
  id?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
  error?: {
    code?: string;
    message?: string;
  };
};

export class AiProviderError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AiProviderError";
    this.code = code;
  }
}

export async function generateAiResponse(
  worker: AiWorkerDefinition,
  messages: AiConversationMessage[]
): Promise<AiProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AiProviderError("openai_not_configured", "OPENAI_API_KEY is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: worker.model,
        instructions: worker.instructions,
        input: messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
        max_output_tokens: 700,
        store: false,
      }),
      signal: controller.signal,
      cache: "no-store",
    });

    const body = (await response.json().catch(() => ({}))) as RawResponse;

    if (!response.ok) {
      throw new AiProviderError(
        body.error?.code || `openai_http_${response.status}`,
        body.error?.message || "OpenAI request failed."
      );
    }

    const text = extractOutputText(body);
    if (!body.id || !text) {
      throw new AiProviderError("openai_invalid_response", "OpenAI returned no usable text response.");
    }

    return {
      responseId: body.id,
      text,
      inputTokens: body.usage?.input_tokens,
      outputTokens: body.usage?.output_tokens,
    };
  } catch (error) {
    if (error instanceof AiProviderError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AiProviderError("openai_timeout", "OpenAI request timed out.");
    }
    throw new AiProviderError("openai_request_failed", "OpenAI request failed.");
  } finally {
    clearTimeout(timeout);
  }
}

function extractOutputText(body: RawResponse) {
  const parts: string[] = [];

  for (const item of body.output ?? []) {
    if (item.type !== "message") continue;
    for (const content of item.content ?? []) {
      if (content.type === "output_text" && typeof content.text === "string") {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n").trim();
}
