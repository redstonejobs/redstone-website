export type SourceAwareJob = {
  source_provider?: string | null;
  source_url?: string | null;
  source_apply_url?: string | null;
  source_employer_name?: string | null;
  source_posted_at?: string | null;
  source_last_seen_at?: string | null;
  source_attribution?: string | null;
  application_mode?: string | null;
  auto_imported?: boolean | null;
  foreign_worker_status?: string | null;
  immigration_evidence?: string | null;
  import_quality_score?: number | null;
};

export function isExternalJob(job: SourceAwareJob) {
  return job.application_mode === "external" && job.source_provider !== "redstone";
}

export function externalJobApplyUrl(job: SourceAwareJob) {
  if (!isExternalJob(job)) return null;
  return safeHttpUrl(job.source_apply_url) ?? safeHttpUrl(job.source_url);
}

export function sourceLabel(job: SourceAwareJob) {
  if (job.source_attribution?.trim()) return job.source_attribution.trim();
  if (job.source_provider === "foundrole") return "FoundRole";
  if (job.source_provider === "jobbank") return "Canada Job Bank";
  return "Red Stone";
}

export function foreignWorkerLabel(value: string | null | undefined) {
  const labels: Record<string, string> = {
    verified_foreign_recruitment: "Foreign recruitment signal verified",
    international_applicants_accepted: "International applicants accepted",
    lmia_requested: "LMIA requested",
    lmia_approved: "LMIA approved",
    sponsorship_confirmed: "Sponsorship stated by source",
    sponsorship_unconfirmed: "Sponsorship unconfirmed",
    requires_existing_authorization: "Existing work authorization required",
    not_suitable: "Not suitable for overseas applicants",
    unknown: "Work authorization not confirmed",
  };
  return labels[value ?? ""] ?? "Work authorization not confirmed";
}

export function safeHttpUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}
