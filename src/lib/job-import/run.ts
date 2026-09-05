import "server-only";

import { createAdminClient } from "@/utils/supabase/admin";
import { classifyExternalJob } from "./classify";
import { normalizedJobPayload, sourceFingerprint } from "./normalize";
import { fetchFoundRoleJobs, foundRoleRuntimeReady } from "./providers/foundrole";
import { fetchJobBankJobs, jobBankRuntimeReady } from "./providers/jobbank";
import type {
  ExternalJobCandidate,
  ImportRunSummary,
  ImportSourceConfig,
  JobImportProvider,
} from "./types";

const PROVIDERS: JobImportProvider[] = ["foundrole", "jobbank"];
const POSITIVE_FOREIGN_STATUSES = new Set([
  "verified_foreign_recruitment",
  "international_applicants_accepted",
  "lmia_requested",
  "lmia_approved",
  "sponsorship_confirmed",
]);

export async function runJobImports(provider?: JobImportProvider | "all") {
  await archiveExpiredExternalJobs();
  const requested = provider && provider !== "all" ? [provider] : PROVIDERS;
  const summaries: ImportRunSummary[] = [];

  for (const current of requested) {
    summaries.push(await runProvider(current));
  }

  return {
    startedAt: new Date().toISOString(),
    summaries,
  };
}

async function runProvider(provider: JobImportProvider): Promise<ImportRunSummary> {
  const supabase = createAdminClient();
  const source = await getSourceConfig(provider);

  if (!source || !source.enabled) {
    return emptySummary(provider, "skipped", "Provider is disabled in job_import_sources.");
  }

  if (!runtimeReady(provider)) {
    return emptySummary(
      provider,
      "skipped",
      provider === "jobbank"
        ? "Awaiting authorized Canada Job Bank XML feed configuration."
        : "Awaiting production-compatible FoundRole feed/OAuth configuration."
    );
  }

  const { data: run, error: runError } = await supabase
    .from("job_import_runs")
    .insert({ provider, status: "running" })
    .select("id")
    .single<{ id: string }>();

  if (runError || !run) {
    throw new Error(`Unable to create ${provider} import run: ${runError?.message ?? "unknown error"}`);
  }

  const counts = { fetched: 0, published: 0, updated: 0, duplicates: 0, rejected: 0, review: 0 };

  try {
    const candidates = await fetchProvider(provider, source.config ?? {});
    counts.fetched = candidates.length;

    for (const candidate of candidates) {
      try {
        const decision = await processCandidate(run.id, source, candidate);
        counts[decision] += 1;
      } catch (error) {
        counts.review += 1;
        await recordImportItem(run.id, candidate, "needs_review", errorMessage(error), null, null);
      }
    }

    const status = counts.review > 0 ? "partial" : "succeeded";
    await finishRun(run.id, status, counts, null);
    await supabase
      .from("job_import_sources")
      .update({ last_success_at: new Date().toISOString(), last_error: null, last_error_at: null })
      .eq("provider", provider);

    return { provider, status, ...counts };
  } catch (error) {
    const message = errorMessage(error);
    await finishRun(run.id, "failed", counts, message);
    await supabase
      .from("job_import_sources")
      .update({ last_error_at: new Date().toISOString(), last_error: message.slice(0, 1500) })
      .eq("provider", provider);
    return { provider, status: "failed", ...counts, message };
  }
}

async function processCandidate(
  runId: string,
  source: ImportSourceConfig,
  candidate: ExternalJobCandidate
): Promise<"published" | "updated" | "duplicates" | "rejected" | "review"> {
  const supabase = createAdminClient();
  const classification = classifyExternalJob(candidate);
  const fingerprint = sourceFingerprint(candidate);

  const { data: existing } = await supabase
    .from("jobs")
    .select("id, status, published_at, source_payload_hash")
    .eq("source_provider", candidate.provider)
    .eq("source_external_id", candidate.externalId)
    .maybeSingle<{ id: string; status: string | null; published_at: string | null; source_payload_hash: string | null }>();

  if (classification.reject) {
    if (existing?.id && existing.status === "published") {
      await supabase.from("jobs").update({ status: "archived", source_status: "closed", source_last_seen_at: new Date().toISOString() }).eq("id", existing.id);
    }
    await recordImportItem(runId, candidate, "rejected", classification.rejectReason, classification.qualityScore, existing?.id ?? null);
    return "rejected";
  }

  if (!existing) {
    const { data: duplicate } = await supabase
      .from("jobs")
      .select("id, source_provider")
      .eq("source_fingerprint", fingerprint)
      .eq("status", "published")
      .neq("source_provider", candidate.provider)
      .limit(1)
      .maybeSingle<{ id: string; source_provider: string | null }>();

    if (duplicate?.id) {
      await recordImportItem(
        runId,
        candidate,
        "duplicate",
        `Equivalent vacancy is already published from ${duplicate.source_provider ?? "another source"}.`,
        classification.qualityScore,
        duplicate.id
      );
      return "duplicates";
    }
  }

  const requireForeignSignal = booleanConfig(source.config?.require_foreign_worker_signal, true);
  const qualifiesForAutoPublish =
    source.auto_publish_enabled &&
    classification.qualityScore >= source.publish_threshold &&
    (!requireForeignSignal || POSITIVE_FOREIGN_STATUSES.has(classification.foreignWorkerStatus));

  if (!qualifiesForAutoPublish) {
    if (existing?.id) {
      await supabase.from("jobs").update({ source_last_seen_at: new Date().toISOString() }).eq("id", existing.id);
    }
    const reason = classification.qualityScore < source.publish_threshold
      ? `Quality score ${classification.qualityScore} is below automatic publish threshold ${source.publish_threshold}.`
      : "No sufficiently strong foreign-worker / international-applicant signal was found in the source listing.";
    await recordImportItem(runId, candidate, "needs_review", reason, classification.qualityScore, existing?.id ?? null);
    return "review";
  }

  const payload = normalizedJobPayload(candidate, classification);
  const publishedAt = existing?.published_at ?? new Date().toISOString();

  if (existing?.id) {
    const { error } = await supabase
      .from("jobs")
      .update({ ...payload, status: "published", published_at: publishedAt })
      .eq("id", existing.id);
    if (error) throw new Error(`Unable to update imported job: ${error.message}`);
    await recordImportItem(runId, candidate, "updated", "Source vacancy refreshed automatically.", classification.qualityScore, existing.id, payload);
    return "updated";
  }

  const { data: inserted, error } = await supabase
    .from("jobs")
    .insert({ ...payload, status: "published", published_at: publishedAt })
    .select("id")
    .single<{ id: string }>();
  if (error || !inserted) throw new Error(`Unable to publish imported job: ${error?.message ?? "unknown error"}`);
  await recordImportItem(runId, candidate, "published", "Passed automatic source, quality and foreign-worker checks.", classification.qualityScore, inserted.id, payload);
  return "published";
}

async function recordImportItem(
  runId: string,
  candidate: ExternalJobCandidate,
  decision: "published" | "updated" | "rejected" | "needs_review" | "duplicate",
  reason: string | null,
  score: number | null,
  jobId: string | null,
  payload?: Record<string, unknown>
) {
  const supabase = createAdminClient();
  const normalized = payload ?? {
    title: candidate.title,
    employer: candidate.companyName,
    country: candidate.country,
    city: candidate.city,
    posted_at: candidate.postedAt,
    deadline: candidate.deadline,
  };
  const { error } = await supabase.from("job_import_items").upsert({
    provider: candidate.provider,
    external_id: candidate.externalId,
    run_id: runId,
    job_id: jobId,
    source_url: candidate.sourceUrl,
    source_apply_url: candidate.applyUrl ?? candidate.sourceUrl,
    fingerprint: sourceFingerprint(candidate),
    payload_hash: typeof payload?.source_payload_hash === "string" ? payload.source_payload_hash : null,
    normalized_payload: normalized,
    decision,
    decision_reason: reason,
    quality_score: score,
    last_seen_at: new Date().toISOString(),
  }, { onConflict: "provider,external_id" });
  if (error) throw new Error(`Unable to record import item: ${error.message}`);
}

async function getSourceConfig(provider: JobImportProvider) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("job_import_sources")
    .select("provider, display_name, enabled, auto_publish_enabled, publish_threshold, external_apply_only, config")
    .eq("provider", provider)
    .maybeSingle<ImportSourceConfig>();
  if (error) throw new Error(`Unable to read ${provider} import configuration: ${error.message}`);
  return data;
}

async function fetchProvider(provider: JobImportProvider, config: Record<string, unknown>) {
  if (provider === "foundrole") return fetchFoundRoleJobs(config);
  return fetchJobBankJobs();
}

function runtimeReady(provider: JobImportProvider) {
  return provider === "foundrole" ? foundRoleRuntimeReady() : jobBankRuntimeReady();
}

async function finishRun(
  runId: string,
  status: "succeeded" | "partial" | "failed",
  counts: { fetched: number; published: number; updated: number; duplicates: number; rejected: number; review: number },
  error: string | null
) {
  const supabase = createAdminClient();
  await supabase.from("job_import_runs").update({
    status,
    completed_at: new Date().toISOString(),
    fetched_count: counts.fetched,
    published_count: counts.published,
    updated_count: counts.updated,
    duplicate_count: counts.duplicates,
    rejected_count: counts.rejected,
    review_count: counts.review,
    error_message: error?.slice(0, 1500) ?? null,
  }).eq("id", runId);
}

async function archiveExpiredExternalJobs() {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  await supabase
    .from("jobs")
    .update({ status: "archived", source_status: "closed" })
    .eq("auto_imported", true)
    .eq("application_mode", "external")
    .eq("status", "published")
    .lt("application_deadline", today);
}

function booleanConfig(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function emptySummary(provider: JobImportProvider, status: "skipped", message: string): ImportRunSummary {
  return { provider, status, fetched: 0, published: 0, updated: 0, duplicates: 0, rejected: 0, review: 0, message };
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
