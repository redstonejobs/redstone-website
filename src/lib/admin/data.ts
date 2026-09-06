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

  let request = supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  for (const [column, value] of Object.entries(filters)) {
    request = request.eq(column, value);
  }

  const { count, error } = await request;

  return error ? null : count ?? 0;
}

export async function countRowsSince(
  table: string,
  column: string,
  isoDate: string
) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true })
    .gte(column, isoDate);

  return error ? null : count ?? 0;
}

export async function countExpiringJobs(days = 14) {
  const today = new Date();
  const horizon = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "published")
    .gte("application_deadline", today.toISOString().slice(0, 10))
    .lte("application_deadline", horizon.toISOString().slice(0, 10));

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

  let request = supabase
    .from(table)
    .select("*", { count: "exact" });

  if (query && searchColumns.length > 0) {
    const pattern = `%${query
      .replaceAll("%", "")
      .replaceAll(",", " ")}%`;

    request = request.or(
      searchColumns
        .map((column) => `${column}.ilike.${pattern}`)
        .join(",")
    );
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

export async function fetchAdminJobs(options: {
  page: number;
  query?: string;
  status?: string;
  country?: string;
  category?: string;
  skillLevel?: string;
  employer?: string;
}) {
  const supabase = await createClient();
  const currentPage = Math.max(options.page, 1);
  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const status = options.status;

  let request = supabase
    .from("jobs")
    .select(
      "id, title, country, city, category, skill_level, vacancies, status, application_deadline, published_at, updated_at, created_at, employer_id, employer:employers(company_name), applications(count)",
      { count: "exact" }
    );

  if (options.query) {
    const pattern = `%${options.query
      .replaceAll("%", "")
      .replaceAll(",", " ")}%`;

    request = request.or(
      ["title", "country", "city", "category", "skill_level", "status"]
        .map((column) => `${column}.ilike.${pattern}`)
        .join(",")
    );
  }

  if (status === "expired") {
    request = request
      .neq("status", "archived")
      .not("application_deadline", "is", null)
      .lt("application_deadline", new Date().toISOString().slice(0, 10));
  } else if (status && status !== "all") {
    request = request.eq("status", status);
  }

  if (options.country) request = request.eq("country", options.country);
  if (options.category) request = request.eq("category", options.category);
  if (options.skillLevel) request = request.eq("skill_level", options.skillLevel);
  if (options.employer) request = request.eq("employer_id", options.employer);

  const { data, count, error } = await request
    .order("updated_at", { ascending: false, nullsFirst: false })
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

  return supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle<Row>();
}

/* =========================================================
   STAFF PERSONNEL RECORD
   ========================================================= */

export async function fetchStaffRecord(id: string) {
  const supabase = await createClient();

  const [
    { data: profile, error: profileError },
    { data: roles, error: rolesError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle<Row>(),

    supabase
      .from("staff_roles")
      .select("*")
      .eq("user_id", id)
      .order("created_at", { ascending: true })
      .returns<Row[]>(),
  ]);

  const allRoles = roles ?? [];

  const activeRoles = allRoles.filter(
    (role) => role.active !== false
  );

  const rolePriority = [
    "super_admin",
    "admin",
    "hr",
    "finance",
    "recruiter",
    "moderator",
    "staff",
  ];

  const primaryRole =
    rolePriority
      .map((roleName) =>
        activeRoles.find(
          (role) => String(role.role ?? "") === roleName
        )
      )
      .find(Boolean) ??
    activeRoles[0] ??
    null;

  return {
    profile,
    roles: allRoles,
    activeRoles,
    primaryRole,
    error: profileError ?? rolesError ?? null,
  };
}

/* =========================================================
   JOB EDITING
   ========================================================= */

export async function fetchJobForEdit(id: string) {
  const supabase = await createClient();

  const [
    { data: job, error },
    { data: requirements },
  ] = await Promise.all([
    supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .maybeSingle<Row>(),

    supabase
      .from("job_document_requirements")
      .select(
        "document_type, required, fee_applicable, cost_responsibility, notes, sort_order"
      )
      .eq("job_id", id)
      .order("sort_order", { ascending: true })
      .returns<Row[]>(),
  ]);

  if (!job) {
    return {
      data: job,
      error,
    };
  }

  return {
    data: {
      ...job,

      document_requirements_text: (requirements ?? [])
        .map((row) =>
          [
            row.document_type,
            row.required === false ? "optional" : "required",
            row.fee_applicable === false ? "no_fee" : "fee",
            row.cost_responsibility ?? "candidate",
            row.notes ?? "",
          ]
            .filter((value) => value !== "")
            .join("|")
        )
        .join("\n"),
    },

    error,
  };
}

/* =========================================================
   COUNTRY SETTINGS
   ========================================================= */

export async function fetchCountrySettings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("country_recruitment_settings")
    .select("*")
    .order("display_order", { ascending: true })
    .returns<Row[]>();

  return {
    rows: data ?? [],
    error,
  };
}

/* =========================================================
   EMPLOYERS
   ========================================================= */

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

    searchColumns: [
      "company_name",
      "registration_number",
      "email",
      "phone",
    ],

    filters: {
      country: options.country,
      verification_status: options.verificationStatus,
      is_active: options.active,
    },

    orderBy:
      options.sort === "company"
        ? "company_name"
        : "created_at",

    ascending: options.sort === "company",
  });

  const supabase = await createClient();

  const ids = result.rows
    .map((row) => String(row.id))
    .filter(Boolean);

  if (ids.length === 0) {
    return {
      ...result,
      rows: [],
    };
  }

  const counts = new Map<
    string,
    {
      total: number | null;
      published: number | null;
    }
  >();

  await Promise.all(
    ids.map(async (employerId) => {
      const [total, published] = await Promise.all([
        countJobsForEmployer(supabase, employerId),
        countJobsForEmployer(supabase, employerId, "published"),
      ]);

      counts.set(employerId, {
        total,
        published,
      });
    })
  );

  return {
    ...result,

    rows: result.rows.map((row) => ({
      ...row,

      job_count:
        counts.get(String(row.id))?.total ?? 0,

      published_job_count:
        counts.get(String(row.id))?.published ?? 0,
    })),
  };
}

async function countJobsForEmployer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  employerId: string,
  status?: string
) {
  let request = supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("employer_id", employerId);

  if (status) {
    request = request.eq("status", status);
  }

  const { count, error } = await request;

  return error ? null : count ?? 0;
}

/* =========================================================
   APPLICATIONS
   ========================================================= */

export async function fetchApplicationsWithRelations(
  options: {
    page: number;
    query?: string;
    filters?: Record<string, string | undefined>;
  }
) {
  const result = await fetchRows({
    table: "applications",
    page: options.page,
    query: options.query,

    searchColumns: [
      "status",
      "cover_letter",
      "candidate_notes",
      "internal_notes",
    ],

    filters: options.filters,
  });

  return attachApplicationRelations(result);
}

export async function attachApplicationRelations<
  T extends {
    rows: Row[];
  }
>(result: T) {
  const supabase = await createClient();

  const candidateIds = uniqueIds(
    result.rows,
    "candidate_id"
  );

  const jobIds = uniqueIds(
    result.rows,
    "job_id"
  );

  const staffIds = uniqueIds(
    result.rows,
    "assigned_staff_id"
  );

  const [
    { data: candidates },
    { data: jobs },
    { data: staff },
  ] = await Promise.all([
    candidateIds.length
      ? supabase
          .from("profiles")
          .select(
            "id, full_name, nationality, city, country, phone, referred_by_staff_id, referral_attributed_at"
          )
          .in("id", candidateIds)
          .returns<Row[]>()
      : Promise.resolve({
          data: [] as Row[],
        }),

    jobIds.length
      ? supabase
          .from("jobs")
          .select(
            "id, title, country, city, employer_id, status"
          )
          .in("id", jobIds)
          .returns<Row[]>()
      : Promise.resolve({
          data: [] as Row[],
        }),

    staffIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", staffIds)
          .returns<Row[]>()
      : Promise.resolve({
          data: [] as Row[],
        }),
  ]);

  const employerIds = uniqueIds(
    jobs ?? [],
    "employer_id"
  );

  const { data: employers } =
    employerIds.length
      ? await supabase
          .from("employers")
          .select("id, company_name")
          .in("id", employerIds)
          .returns<Row[]>()
      : {
          data: [] as Row[],
        };

  const referralStaffIds = Array.from(
    new Set(
      (candidates ?? [])
        .map((candidate) => String(candidate.referred_by_staff_id ?? ""))
        .filter(Boolean),
    ),
  );

  const { data: referralStaff } = referralStaffIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, staff_id, referral_code")
        .in("id", referralStaffIds)
        .returns<Row[]>()
    : { data: [] as Row[] };

  const candidateMap = mapById(
    candidates ?? []
  );

  const jobMap = mapById(
    jobs ?? []
  );

  const staffMap = mapById(
    staff ?? []
  );

  const referralStaffMap = mapById(
    referralStaff ?? []
  );

  const employerMap = mapById(
    employers ?? []
  );

  return {
    ...result,

    rows: result.rows.map((application) => {
      const job = jobMap.get(
        String(application.job_id ?? "")
      );
      const candidate =
        candidateMap.get(String(application.candidate_id ?? "")) ?? null;

      return {
        ...application,

        candidate,

        job: job ?? null,

        employer: job
          ? employerMap.get(
              String(job.employer_id ?? "")
            ) ?? null
          : null,

        assigned_staff:
          staffMap.get(
            String(
              application.assigned_staff_id ?? ""
            )
          ) ?? null,

        referral_staff: candidate?.referred_by_staff_id
          ? referralStaffMap.get(String(candidate.referred_by_staff_id)) ?? null
          : null,
      };
    }),
  };
}

/* =========================================================
   DOCUMENTS
   ========================================================= */

export async function fetchDocumentsWithRelations(
  options: {
    page: number;
    query?: string;
    filters?: Record<string, string | undefined>;
  }
) {
  const result = await fetchRows({
    table: "application_documents",
    page: options.page,
    query: options.query,

    searchColumns: [
      "file_name",
      "document_type",
      "verification_status",
    ],

    filters: options.filters,
  });

  const applicationIds = uniqueIds(
    result.rows,
    "application_id"
  );

  const staffIds = uniqueIds(
    result.rows,
    "verified_by"
  );

  const supabase = await createClient();

  const [
    { data: applications },
    { data: reviewers },
  ] = await Promise.all([
    applicationIds.length
      ? supabase
          .from("applications")
          .select(
            "id, candidate_id, job_id, status"
          )
          .in("id", applicationIds)
          .returns<Row[]>()
      : Promise.resolve({
          data: [] as Row[],
        }),

    staffIds.length
      ? supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", staffIds)
          .returns<Row[]>()
      : Promise.resolve({
          data: [] as Row[],
        }),
  ]);

  const enrichedApplications =
    await attachApplicationRelations({
      rows: applications ?? [],
    });

  const applicationMap = mapById(
    enrichedApplications.rows
  );

  const reviewerMap = mapById(
    reviewers ?? []
  );

  return {
    ...result,

    rows: result.rows.map((document) => ({
      ...document,

      application:
        applicationMap.get(
          String(document.application_id ?? "")
        ) ?? null,

      reviewer:
        reviewerMap.get(
          String(document.verified_by ?? "")
        ) ?? null,
    })),
  };
}

/* =========================================================
   INTERNAL HELPERS
   ========================================================= */

function uniqueIds(
  rows: Row[],
  key: string
) {
  return Array.from(
    new Set(
      rows
        .map((row) => row[key])
        .filter(
          (value): value is string =>
            typeof value === "string" &&
            value.length > 0
        )
    )
  );
}

function mapById(rows: Row[]) {
  return new Map(
    rows.map((row) => [
      String(row.id),
      row,
    ])
  );
}

/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

export async function getDashboardData() {
  const supabase = await createClient();

  const today = new Date();

  today.setUTCHours(
    0,
    0,
    0,
    0
  );

  const [
    publishedJobs,
    draftJobs,
    totalJobs,
    expiringSoon,
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
    countRows("jobs", {
      status: "published",
    }),

    countRows("jobs", {
      status: "draft",
    }),

    countRows("jobs"),

    countExpiringJobs(14),

    countRows("applications"),


    countRowsSince(
      "applications",
      "submitted_at",
      today.toISOString()
    ),

    countRows("profiles", {
      profile_type: "candidate",
    }),

    countRows("employers"),

    countRows("application_documents", {
      verification_status: "pending",
    }),

    countRows("applications", {
      status: "shortlisted",
    }),

    countRows("applications", {
      status: "interview",
    }),

    countRows("applications", {
      status: "visa_processing",
    }),

    countRows("applications", {
      status: "approved",
    }),

    countRows("applications", {
      status: "deployed",
    }),

    supabase
      .from("applications")
      .select(
        "id, status, candidate_id, job_id, assigned_staff_id, submitted_at, reviewed_at, created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(6)
      .returns<Row[]>(),

    supabase
      .from("jobs")
      .select(
        "id, title, status, country, city, application_deadline, created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(6)
      .returns<Row[]>(),

    supabase
      .from("application_documents")
      .select(
        "id, application_id, file_name, document_type, verification_status, verified_by, created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(6)
      .returns<Row[]>(),

    supabase
      .from("employers")
      .select(
        "id, company_name, verification_status, country, city, is_active, created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(6)
      .returns<Row[]>(),

    supabase
      .from("applications")
      .select("*", {
        count: "exact",
        head: true,
      })
      .is(
        "assigned_staff_id",
        null
      ),

    supabase
      .from("jobs")
      .select(
        "id, title, status, country, city, application_deadline"
      )
      .gte(
        "application_deadline",
        new Date()
          .toISOString()
          .slice(0, 10)
      )
      .lte(
        "application_deadline",
        new Date(
          Date.now() +
            14 *
              24 *
              60 *
              60 *
              1000
        )
          .toISOString()
          .slice(0, 10)
      )
      .order(
        "application_deadline",
        {
          ascending: true,
        }
      )
      .limit(6)
      .returns<Row[]>(),

    supabase
      .from("admin_audit_logs")
      .select(
        "id, actor_user_id, actor_role, action, entity_type, entity_id, description, created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(6)
      .returns<Row[]>(),

    supabase
      .from("staff_roles")
      .select(
        "id, user_id, role, active, created_at"
      )
      .eq("active", true)
      .limit(8)
      .returns<Row[]>(),
  ]);

  const metrics: CountMetric[] = [
    {
      label: "Published Jobs",
      value: publishedJobs,
      href: "/admin/jobs?status=published",
      tone: "green",
    },
    {
      label: "Draft Jobs",
      value: draftJobs,
      href: "/admin/jobs?status=draft",
      tone: "slate",
    },
    {
      label: "Total Jobs",
      value: totalJobs,
      href: "/admin/jobs",
      tone: "navy",
    },
    {
      label: "Total Applications",
      value: totalApplications,
      href: "/admin/applications",
      tone: "navy",
    },
    {
      label: "Applications Today",
      value: applicationsToday,
      href: "/admin/applications",
      tone: "gold",
    },
    {
      label: "Expiring Soon",
      value: expiringSoon,
      href: "/admin/jobs?status=expired",
      tone: "red",
    },
    {
      label: "Candidates",
      value: candidates,
      href: "/admin/candidates",
      tone: "blue",
    },
    {
      label: "Employers",
      value: employers,
      href: "/admin/employers",
      tone: "navy",
    },
    {
      label: "Pending Documents",
      value: pendingDocuments,
      href: "/admin/documents",
      tone: "amber",
    },
    {
      label: "Shortlisted",
      value: shortlisted,
      href: "/admin/applications?status=shortlisted",
      tone: "green",
    },
    {
      label: "Interviews",
      value: interviews,
      href: "/admin/applications?status=interview",
      tone: "amber",
    },
    {
      label: "Visa Processing",
      value: visaProcessing,
      href: "/admin/applications?status=visa_processing",
      tone: "blue",
    },
    {
      label: "Approved",
      value: approved,
      href: "/admin/applications?status=approved",
      tone: "green",
    },
    {
      label: "Deployed",
      value: deployed,
      href: "/admin/applications?status=deployed",
      tone: "navy",
    },
  ];

  const pipeline = await Promise.all(
    APPLICATION_STATUSES.map(
      async (status) => ({
        status,

        count: await countRows(
          "applications",
          {
            status,
          }
        ),
      })
    )
  );

  return {
    metrics,
    pipeline,

    recentApplications:
      recentApplications.data ?? [],

    latestJobs:
      latestJobs.data ?? [],

    documentQueue:
      documentQueue.data ?? [],

    employerQueue:
      employerQueue.data ?? [],

    needsAttention: [
      {
        label:
          "Applications Awaiting Review",

        value: await countRows(
          "applications",
          {
            status: "submitted",
          }
        ),
      },

      {
        label: "Pending Documents",
        value: pendingDocuments,
      },

      {
        label:
          "Employer Verification Pending",

        value: await countRows(
          "employers",
          {
            verification_status:
              "pending",
          }
        ),
      },

      {
        label:
          "Employer Vacancy Requests",

        value: await countRows(
          "employer_job_requests",
          {
            status:
              "submitted_for_review",
          }
        ),
      },

      {
        label:
          "Employer Interview Requests",

        value: await countRows(
          "employer_interview_requests",
          {
            status: "requested",
          }
        ),
      },

      {
        label:
          "Employer Decisions Needing Action",

        value: await countRows(
          "employer_application_decisions",
          {
            decision: "selected",
          }
        ),
      },

      {
        label: "Interviews",
        value: interviews,
      },

      {
        label: "Visa Processing",
        value: visaProcessing,
      },

      {
        label:
          "Unassigned Applications",

        value:
          unassignedApplications.error
            ? null
            : unassignedApplications.count ??
              0,
      },
    ],

    upcomingDeadlines:
      upcomingDeadlines.data ?? [],

    recentAudit:
      recentAudit.data ?? [],

    activeStaff:
      activeStaff.data ?? [],

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

/* =========================================================
   PAGINATION / QUERY HELPERS
   ========================================================= */

export function getPage(
  searchParams: Record<
    string,
    string | string[] | undefined
  >
) {
  const value =
    searchParams.page;

  const raw =
    Array.isArray(value)
      ? value[0]
      : value;

  const parsed =
    Number(raw);

  return Number.isFinite(parsed) &&
    parsed > 0
    ? Math.floor(parsed)
    : 1;
}

export function getParam(
  searchParams: Record<
    string,
    string | string[] | undefined
  >,
  key: string
) {
  const value =
    searchParams[key];

  return Array.isArray(value)
    ? value[0]
    : value;
}
