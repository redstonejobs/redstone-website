import { createClient } from "@/utils/supabase/server";
import type { CandidateContext, CandidateRow } from "./types";

const JOB_FIELDS = "id, title, slug, country, city, category, job_type, skill_level, short_description, description, salary_min, salary_max, currency, salary_period, salary_confirmed, salary_note, contract_type, contract_duration_value, contract_duration_unit, contract_note, working_hours_per_week, work_schedule, overtime_note, vacancies, application_deadline, visa_sponsorship, accommodation, transport, meals, sponsorship_status, accommodation_status, meals_status, transport_status, medical_insurance_status, air_ticket_status, training_status, annual_leave_note, other_benefits, country_fee_override, country_fee_override_currency, country_fee_override_note, fee_relationship, processing_time_min, processing_time_max, processing_time_unit, processing_time_note, employer:employers(company_name, verification_status, is_active)";

export async function getCandidateApplications(context: CandidateContext, statusFilter = "active") {
  const supabase = await createClient();
  let query = supabase
    .from("applications")
    .select("id, job_id, status, submitted_at, created_at, updated_at, cover_letter, relevant_experience, availability")
    .eq("candidate_id", context.user.id)
    .order("created_at", { ascending: false });

  if (statusFilter === "active") query = query.not("status", "in", "(deployed,rejected,withdrawn)");
  if (statusFilter === "completed") query = query.in("status", ["deployed", "approved"]);
  if (statusFilter === "withdrawn") query = query.eq("status", "withdrawn");
  if (statusFilter === "rejected") query = query.eq("status", "rejected");

  const { data, error } = await query.returns<CandidateRow[]>();
  return attachJobs(data ?? [], error);
}

export async function getCandidateApplication(context: CandidateContext, id: string) {
  const supabase = await createClient();
  const { data: application, error } = await supabase
    .from("applications")
    .select("id, job_id, status, submitted_at, created_at, updated_at, cover_letter, relevant_experience, availability, candidate_message")
    .eq("id", id)
    .eq("candidate_id", context.user.id)
    .maybeSingle<CandidateRow>();

  if (error || !application) return { application: null, error };

  const [{ rows }, documents, timeline] = await Promise.all([
    attachJobs([application], null),
    getCandidateDocuments(context, id),
    getCandidateTimeline(id),
  ]);

  return { application: rows[0] ?? null, documents: documents.documents, timeline: timeline.events, error: null };
}

export async function getCandidateDocuments(context: CandidateContext, applicationId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("application_documents")
    .select("id, application_id, document_type, file_name, file_size, mime_type, verification_status, verification_note, created_at")
    .order("created_at", { ascending: false });

  if (applicationId) query = query.eq("application_id", applicationId);

  const { data, error } = await query.returns<CandidateRow[]>();
  if (error) return { documents: [], error };

  const applicationIds = [...new Set((data ?? []).map((document) => String(document.application_id ?? "")).filter(Boolean))];
  const { data: applications } = applicationIds.length
    ? await supabase
        .from("applications")
        .select("id, candidate_id, job_id, status")
        .eq("candidate_id", context.user.id)
        .in("id", applicationIds)
        .returns<CandidateRow[]>()
    : { data: [] as CandidateRow[] };
  const allowed = new Set((applications ?? []).map((application) => String(application.id)));

  return {
    documents: (data ?? []).filter((document) => allowed.has(String(document.application_id ?? ""))),
    error: null,
  };
}

export async function getCandidateTimeline(applicationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("application_status_history")
    .select("id, previous_status, new_status, created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true })
    .returns<CandidateRow[]>();

  return { events: error ? [] : data ?? [], error };
}

export async function getRecentPublishedJobs(limit = 4) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_FIELDS)
    .eq("status", "published")
    .not("slug", "is", null)
    .or(`application_deadline.is.null,application_deadline.gte.${todayDate()}`)
    .or("vacancies.is.null,vacancies.gt.0")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit)
    .returns<CandidateRow[]>();

  return { jobs: data ?? [], error };
}

export async function getPublishedJobBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_FIELDS)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<CandidateRow>();

  return { job: data, error };
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

async function attachJobs(applications: CandidateRow[], error: unknown): Promise<{ rows: CandidateRow[]; error: unknown }> {
  if (error || applications.length === 0) return { rows: applications, error };

  const supabase = await createClient();
  const jobIds = [...new Set(applications.map((application) => String(application.job_id ?? "")).filter(Boolean))];
  const { data: jobs } = await supabase.from("jobs").select(JOB_FIELDS).in("id", jobIds).returns<CandidateRow[]>();
  const jobMap = new Map((jobs ?? []).map((job) => [String(job.id), job]));

  return {
    rows: applications.map((application) => ({ ...application, job: jobMap.get(String(application.job_id ?? "")) ?? null }) as CandidateRow),
    error,
  };
}
