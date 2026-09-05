import "server-only";

import { createClient } from "@/utils/supabase/server";

export type JobImportSourceRow = {
  provider: string;
  display_name: string;
  enabled: boolean;
  auto_publish_enabled: boolean;
  publish_threshold: number;
  external_apply_only: boolean;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error: string | null;
};

export type JobImportRunRow = {
  id: string;
  provider: string;
  status: string;
  started_at: string;
  completed_at: string | null;
  fetched_count: number;
  published_count: number;
  updated_count: number;
  duplicate_count: number;
  rejected_count: number;
  review_count: number;
  error_message: string | null;
};

export type JobImportItemRow = {
  id: string;
  provider: string;
  external_id: string;
  job_id: string | null;
  decision: string;
  decision_reason: string | null;
  quality_score: number | null;
  source_url: string | null;
  last_seen_at: string;
  normalized_payload: Record<string, unknown> | null;
};

export async function getJobImportDashboard() {
  const supabase = await createClient();
  const [sourcesResult, runsResult, itemsResult] = await Promise.all([
    supabase
      .from("job_import_sources")
      .select("provider, display_name, enabled, auto_publish_enabled, publish_threshold, external_apply_only, last_success_at, last_error_at, last_error")
      .order("provider")
      .returns<JobImportSourceRow[]>(),
    supabase
      .from("job_import_runs")
      .select("id, provider, status, started_at, completed_at, fetched_count, published_count, updated_count, duplicate_count, rejected_count, review_count, error_message")
      .order("started_at", { ascending: false })
      .limit(20)
      .returns<JobImportRunRow[]>(),
    supabase
      .from("job_import_items")
      .select("id, provider, external_id, job_id, decision, decision_reason, quality_score, source_url, last_seen_at, normalized_payload")
      .order("last_seen_at", { ascending: false })
      .limit(50)
      .returns<JobImportItemRow[]>(),
  ]);

  return {
    sources: sourcesResult.data ?? [],
    runs: runsResult.data ?? [],
    items: itemsResult.data ?? [],
    error: sourcesResult.error ?? runsResult.error ?? itemsResult.error ?? null,
  };
}
