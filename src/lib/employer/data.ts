import { createClient } from "@/utils/supabase/server";
import type { Row } from "@/lib/admin/types";
import type { EmployerContext } from "./types";

const PAGE_SIZE = 10;
const SAFE_APPLICANT_SELECT = "id, job_id, candidate_id, status, submitted_at, created_at, cover_letter, relevant_experience, availability";
const EMPLOYER_JOB_REQUEST_SELECT = "id, employer_id, title, country, city, category, job_type, skill_level, short_description, description, responsibilities, requirements, experience_requirements, education_requirements, language_requirements, salary_min, salary_max, currency, salary_period, salary_confirmed, contract_type, contract_duration_value, contract_duration_unit, working_hours_per_week, work_schedule, vacancies, requested_application_deadline, sponsorship_status, accommodation_status, meals_status, transport_status, medical_insurance_status, air_ticket_status, required_documents, notes_to_red_stone, linked_job_id, status, submitted_at, reviewed_at, created_at, updated_at";

export async function getEmployerDashboard(context: EmployerContext) {
  const supabase = await createClient();
  const employerId = String(context.employer.id);
  const [
    activeJobs,
    draftRequests,
    underReview,
    applicants,
    shortlisted,
    interviews,
    selected,
    recentJobs,
    recentApplicants,
    notifications,
  ] = await Promise.all([
    count("jobs", { employer_id: employerId, status: "published" }),
    count("employer_job_requests", { employer_id: employerId, status: "employer_draft" }),
    count("employer_job_requests", { employer_id: employerId, status: "submitted_for_review" }),
    countApplicationsForEmployer(employerId),
    count("employer_application_decisions", { employer_id: employerId, decision: "shortlisted" }),
    count("employer_interview_requests", { employer_id: employerId, status: "requested" }),
    count("employer_application_decisions", { employer_id: employerId, decision: "selected" }),
    supabase.from("jobs").select("id, title, country, status, application_deadline, created_at").eq("employer_id", employerId).order("created_at", { ascending: false }).limit(5).returns<Row[]>(),
    getEmployerApplicants(context, 1),
    supabase.from("employer_notifications").select("id, title, body, read_at, created_at").eq("employer_id", employerId).order("created_at", { ascending: false }).limit(5).returns<Row[]>(),
  ]);

  return {
    metrics: { activeJobs, draftRequests, underReview, applicants, shortlisted, interviews, selected },
    recentJobs: recentJobs.data ?? [],
    recentApplicants: recentApplicants.rows.slice(0, 5),
    notifications: notifications.data ?? [],
  };
}

export async function getEmployerJobRequests(context: EmployerContext, page = 1, status?: string) {
  const supabase = await createClient();
  const employerId = String(context.employer.id);
  const from = (Math.max(page, 1) - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let query = supabase.from("employer_job_requests").select(EMPLOYER_JOB_REQUEST_SELECT, { count: "exact" }).eq("employer_id", employerId);
  if (status) query = query.eq("status", status);
  const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, to).returns<Row[]>();

  return { rows: data ?? [], count: error ? null : count ?? 0, page, pageSize: PAGE_SIZE, error };
}

export async function getEmployerJobRequest(context: EmployerContext, id: string) {
  const supabase = await createClient();
  return supabase.from("employer_job_requests").select(EMPLOYER_JOB_REQUEST_SELECT).eq("id", id).eq("employer_id", String(context.employer.id)).maybeSingle<Row>();
}

export async function getEmployerApplicants(context: EmployerContext, page = 1) {
  const supabase = await createClient();
  const employerId = String(context.employer.id);
  const from = (Math.max(page, 1) - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count, error } = await supabase
    .from("applications")
    .select(`${SAFE_APPLICANT_SELECT}, job:jobs!inner(id, title, country, city)`, { count: "exact" })
    .eq("job.employer_id", employerId)
    .order("created_at", { ascending: false })
    .range(from, to)
    .returns<Row[]>();
  const candidateIds = [...new Set((data ?? []).map((row) => String(row.candidate_id ?? "")).filter(Boolean))];
  const [{ data: decisions }, { data: candidates }] = await Promise.all([
    supabase.from("employer_application_decisions").select("application_id, decision, note").eq("employer_id", employerId).returns<Row[]>(),
    candidateIds.length ? supabase.from("profiles").select("id, full_name, nationality, city, country").in("id", candidateIds).returns<Row[]>() : Promise.resolve({ data: [] as Row[] }),
  ]);
  const decisionMap = new Map((decisions ?? []).map((decision) => [String(decision.application_id), decision]));
  const candidateMap = new Map((candidates ?? []).map((candidate) => [String(candidate.id), candidate]));

  return {
    rows: (data ?? []).map((application) => ({
      ...application,
      job: embeddedJob(application),
      candidate: candidateMap.get(String(application.candidate_id)) ?? null,
      employer_decision: decisionMap.get(String(application.id)) ?? null,
    })) as Row[],
    count: error ? 0 : count ?? 0,
    page,
    pageSize: PAGE_SIZE,
  };
}

export async function getEmployerApplicant(context: EmployerContext, applicationId: string) {
  const supabase = await createClient();
  const employerId = String(context.employer.id);

  const { data: application } = await supabase
    .from("applications")
    .select(`${SAFE_APPLICANT_SELECT}, job:jobs!inner(id, title, country, city)`)
    .eq("id", applicationId)
    .eq("job.employer_id", employerId)
    .maybeSingle<Row>();
  if (!application) return { application: null, documents: [] as Row[] };

  const [{ data: documents }, { data: candidate }, { data: decision }] = await Promise.all([
    supabase
    .from("application_documents")
    .select("id, application_id, document_type, file_name, file_size, mime_type, created_at")
    .eq("application_id", applicationId)
    .in("document_type", ["cv", "cv_cover_letter"])
      .returns<Row[]>(),
    supabase.from("profiles").select("id, full_name, nationality, city, country").eq("id", String(application.candidate_id)).maybeSingle<Row>(),
    supabase.from("employer_application_decisions").select("application_id, decision, note").eq("employer_id", employerId).eq("application_id", applicationId).maybeSingle<Row>(),
  ]);

  return {
    application: {
      ...application,
      job: embeddedJob(application),
      candidate: candidate ?? null,
      employer_decision: decision ?? null,
    } as Row,
    documents: documents ?? [],
  };
}

export async function getEmployerInterviews(context: EmployerContext) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employer_interview_requests")
    .select("id, application_id, preferred_times, timezone, method, interviewer_name, status, created_at")
    .eq("employer_id", String(context.employer.id))
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<Row[]>();

  return data ?? [];
}

export async function getEmployerDocuments(context: EmployerContext) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("employer_verification_documents")
    .select("id, document_type, file_name, status, created_at")
    .eq("employer_id", String(context.employer.id))
    .order("created_at", { ascending: false })
    .returns<Row[]>();
  return data ?? [];
}

async function count(table: string, filters: Record<string, string>) {
  const supabase = await createClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true });
  for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
  const { count: result, error } = await query;
  return error ? null : result ?? 0;
}

async function countApplicationsForEmployer(employerId: string) {
  const supabase = await createClient();
  const { count: result, error } = await supabase
    .from("applications")
    .select("id, job:jobs!inner(id)", { count: "exact", head: true })
    .eq("job.employer_id", employerId);
  return error ? null : result ?? 0;
}

function embeddedJob(application: Row) {
  const job = application.job;
  if (Array.isArray(job)) return (job[0] ?? null) as Row | null;
  return job && typeof job === "object" ? (job as Row) : null;
}
