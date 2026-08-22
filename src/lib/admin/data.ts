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
    errors: [
      recentApplications.error,
      latestJobs.error,
      documentQueue.error,
      employerQueue.error,
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
