import { createClient } from "@/utils/supabase/server";
import { APPLICATION_STATUSES } from "./status";
import type { CountMetric, Row } from "./types";

const PAGE_SIZE = 12;

type ListOptions = {
  table: string;
  page?: number;
  query?: string;
  searchColumns?: string[];
  filters?: Record<string, string | undefined>;
  orderBy?: string;
  ascending?: boolean;
};

export async function countRows(
  table: string,
  filters: Record<string, string | boolean> = {}
) {
  const supabase = await createClient();
  let request = supabase.from(table).select("*", { count: "exact", head: true });

  for (const [column, value] of Object.entries(filters)) {
    request = request.eq(column, value);
  }

  const { count, error } = await request;

  return error ? null : count ?? 0;
}

export async function countRowsSince(table: string, column: string, isoDate: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .gte(column, isoDate);

  return error ? null : count ?? 0;
}

export async function fetchRows({
  table,
  page = 1,
  query,
  searchColumns = [],
  filters = {},
  orderBy = "created_at",
  ascending = false,
}: ListOptions) {
  const supabase = await createClient();
  const currentPage = Math.max(page, 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  let request = supabase.from(table).select("*", { count: "exact" });

  if (query && searchColumns.length > 0) {
    const pattern = `%${query.replaceAll("%", "").replaceAll(",", " ")}%`;
    request = request.or(searchColumns.map((column) => `${column}.ilike.${pattern}`).join(","));
  }

  for (const [column, value] of Object.entries(filters)) {
    if (value) {
      request = request.eq(column, value);
    }
  }

  const { data, count, error } = await request
    .order(orderBy, { ascending })
    .range(from, to)
    .returns<Row[]>();

  return {
    rows: data ?? [],
    count: error ? null : count ?? 0,
    error,
    page: currentPage,
    pageSize: PAGE_SIZE,
  };
}

export async function fetchById(table: string, id: string) {
  const supabase = await createClient();

  return supabase.from(table).select("*").eq("id", id).maybeSingle<Row>();
}

export async function fetchEmployersWithJobCounts(options: {
  page: number;
  query?: string;
  verificationStatus?: string;
  active?: string;
  country?: string;
  sort?: string;
}) {
  const result = await fetchRows({
    table: "employers",
    page: options.page,
    query: options.query,
    searchColumns: ["company_name", "registration_number", "email", "phone"],
    filters: {
      country: options.country,
      verification_status: options.verificationStatus,
      is_active: options.active,
    },
    orderBy: options.sort === "company" ? "company_name" : "created_at",
    ascending: options.sort === "company",
  });
  const supabase = await createClient();
  const ids = result.rows.map((row) => String(row.id)).filter(Boolean);

  if (ids.length === 0) {
    return { ...result, rows: [] };
  }

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, employer_id, status")
    .in("employer_id", ids)
    .returns<Row[]>();
  const counts = new Map<string, { total: number; published: number }>();

  for (const job of jobs ?? []) {
    const employerId = String(job.employer_id ?? "");
    const current = counts.get(employerId) ?? { total: 0, published: 0 };
    current.total += 1;
    if (job.status === "published") current.published += 1;
    counts.set(employerId, current);
  }

  return {
    ...result,
    rows: result.rows.map((row) => ({
      ...row,
      job_count: counts.get(String(row.id))?.total ?? 0,
      published_job_count: counts.get(String(row.id))?.published ?? 0,
    })),
  };
}

export async function fetchApplicationsWithRelations(options: {
  page: number;
  query?: string;
  filters?: Record<string, string | undefined>;
}) {
  const result = await fetchRows({
    table: "applications",
    page: options.page,
    query: options.query,
    searchColumns: ["status", "cover_letter", "candidate_notes", "internal_notes"],
    filters: options.filters,
  });

  return attachApplicationRelations(result);
}

export async function attachApplicationRelations<T extends { rows: Row[] }>(result: T) {
  const supabase = await createClient();
  const candidateIds = uniqueIds(result.rows, "candidate_id");
  const jobIds = uniqueIds(result.rows, "job_id");
  const staffIds = uniqueIds(result.rows, "assigned_staff_id");
  const [{ data: candidates }, { data: jobs }, { data: staff }] = await Promise.all([
    candidateIds.length
      ? supabase.from("profiles").select("id, full_name, nationality, city, country, phone").in("id", candidateIds).returns<Row[]>()
      : Promise.resolve({ data: [] as Row[] }),
    jobIds.length
      ? supabase.from("jobs").select("id, title, country, city, employer_id, status").in("id", jobIds).returns<Row[]>()
      : Promise.resolve({ data: [] as Row[] }),
    staffIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", staffIds).returns<Row[]>()
      : Promise.resolve({ data: [] as Row[] }),
  ]);
  const employerIds = uniqueIds(jobs ?? [], "employer_id");
  const { data: employers } = employerIds.length
    ? await supabase.from("employers").select("id, company_name").in("id", employerIds).returns<Row[]>()
    : { data: [] as Row[] };

  const candidateMap = mapById(candidates ?? []);
  const jobMap = mapById(jobs ?? []);
  const staffMap = mapById(staff ?? []);
  const employerMap = mapById(employers ?? []);

  return {
    ...result,
    rows: result.rows.map((application) => {
      const job = jobMap.get(String(application.job_id ?? ""));
      return {
        ...application,
        candidate: candidateMap.get(String(application.candidate_id ?? "")) ?? null,
        job: job ?? null,
        employer: job ? employerMap.get(String(job.employer_id ?? "")) ?? null : null,
        assigned_staff: staffMap.get(String(application.assigned_staff_id ?? "")) ?? null,
      };
    }),
  };
}

export async function fetchDocumentsWithRelations(options: {
  page: number;
  query?: string;
  filters?: Record<string, string | undefined>;
}) {
  const result = await fetchRows({
    table: "application_documents",
    page: options.page,
    query: options.query,
    searchColumns: ["file_name", "document_type", "verification_status"],
    filters: options.filters,
  });
  const applicationIds = uniqueIds(result.rows, "application_id");
  const staffIds = uniqueIds(result.rows, "verified_by");
  const supabase = await createClient();
  const [{ data: applications }, { data: reviewers }] = await Promise.all([
    applicationIds.length
      ? supabase.from("applications").select("id, candidate_id, job_id, status").in("id", applicationIds).returns<Row[]>()
      : Promise.resolve({ data: [] as Row[] }),
    staffIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", staffIds).returns<Row[]>()
      : Promise.resolve({ data: [] as Row[] }),
  ]);
  const enrichedApplications = await attachApplicationRelations({ rows: applications ?? [] });
  const applicationMap = mapById(enrichedApplications.rows);
  const reviewerMap = mapById(reviewers ?? []);

  return {
    ...result,
    rows: result.rows.map((document) => ({
      ...document,
      application: applicationMap.get(String(document.application_id ?? "")) ?? null,
      reviewer: reviewerMap.get(String(document.verified_by ?? "")) ?? null,
    })),
  };
}

function uniqueIds(rows: Row[], key: string) {
  return Array.from(
    new Set(
      rows
        .map((row) => row[key])
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  );
}

function mapById(rows: Row[]) {
  return new Map(rows.map((row) => [String(row.id), row]));
}

export async function getDashboardData() {
  const supabase = await createClient();
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [
    publishedJobs,
    draftJobs,
    totalApplications,
    applicationsToday,
    candidates,
    employers,
    pendingDocuments,
    shortlisted,
    interviews,
    visaProcessing,
    approved,
    deployed,
    recentApplications,
    latestJobs,
    documentQueue,
    employerQueue,
    unassignedApplications,
    upcomingDeadlines,
    recentAudit,
    activeStaff,
  ] = await Promise.all([
    countRows("jobs", { status: "published" }),
    countRows("jobs", { status: "draft" }),
    countRows("applications"),
    countRowsSince("applications", "submitted_at", today.toISOString()),
    countRows("profiles", { profile_type: "candidate" }),
    countRows("employers"),
    countRows("application_documents", { verification_status: "pending" }),
    countRows("applications", { status: "shortlisted" }),
    countRows("applications", { status: "interview" }),
    countRows("applications", { status: "visa_processing" }),
    countRows("applications", { status: "approved" }),
    countRows("applications", { status: "deployed" }),
    supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
      .returns<Row[]>(),
    supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
      .returns<Row[]>(),
    supabase
      .from("application_documents")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
      .returns<Row[]>(),
    supabase
      .from("employers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
      .returns<Row[]>(),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .is("assigned_staff_id", null),
    supabase
      .from("jobs")
      .select("*")
      .gte("deadline", new Date().toISOString().slice(0, 10))
      .lte("deadline", new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10))
      .order("deadline", { ascending: true })
      .limit(6)
      .returns<Row[]>(),
    supabase
      .from("admin_audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(6)
      .returns<Row[]>(),
    supabase
      .from("staff_roles")
      .select("*")
      .eq("active", true)
      .limit(8)
      .returns<Row[]>(),
  ]);

  const metrics: CountMetric[] = [
    { label: "Published Jobs", value: publishedJobs, href: "/admin/jobs?status=published", tone: "green" },
    { label: "Draft Jobs", value: draftJobs, href: "/admin/jobs?status=draft", tone: "slate" },
    { label: "Total Applications", value: totalApplications, href: "/admin/applications", tone: "navy" },
    { label: "Applications Today", value: applicationsToday, href: "/admin/applications", tone: "gold" },
    { label: "Candidates", value: candidates, href: "/admin/candidates", tone: "blue" },
    { label: "Employers", value: employers, href: "/admin/employers", tone: "navy" },
    { label: "Pending Documents", value: pendingDocuments, href: "/admin/documents", tone: "amber" },
    { label: "Shortlisted", value: shortlisted, href: "/admin/applications?status=shortlisted", tone: "green" },
    { label: "Interviews", value: interviews, href: "/admin/applications?status=interview", tone: "amber" },
    { label: "Visa Processing", value: visaProcessing, href: "/admin/applications?status=visa_processing", tone: "blue" },
    { label: "Approved", value: approved, href: "/admin/applications?status=approved", tone: "green" },
    { label: "Deployed", value: deployed, href: "/admin/applications?status=deployed", tone: "navy" },
  ];

  const pipeline = await Promise.all(
    APPLICATION_STATUSES.map(async (status) => ({
      status,
      count: await countRows("applications", { status }),
    }))
  );

  return {
    metrics,
    pipeline,
    recentApplications: recentApplications.data ?? [],
    latestJobs: latestJobs.data ?? [],
    documentQueue: documentQueue.data ?? [],
    employerQueue: employerQueue.data ?? [],
    needsAttention: [
      { label: "Applications Awaiting Review", value: await countRows("applications", { status: "submitted" }) },
      { label: "Pending Documents", value: pendingDocuments },
      { label: "Employer Verification Pending", value: await countRows("employers", { verification_status: "pending" }) },
      { label: "Interviews", value: interviews },
      { label: "Visa Processing", value: visaProcessing },
      { label: "Unassigned Applications", value: unassignedApplications.error ? null : unassignedApplications.count ?? 0 },
    ],
    upcomingDeadlines: upcomingDeadlines.data ?? [],
    recentAudit: recentAudit.data ?? [],
    activeStaff: activeStaff.data ?? [],
    errors: [
      recentApplications.error,
      latestJobs.error,
      documentQueue.error,
      employerQueue.error,
      upcomingDeadlines.error,
      recentAudit.error,
      activeStaff.error,
    ].filter(Boolean),
  };
}

export function getPage(searchParams: Record<string, string | string[] | undefined>) {
  const value = searchParams.page;
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
}

export function getParam(searchParams: Record<string, string | string[] | undefined>, key: string) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}
