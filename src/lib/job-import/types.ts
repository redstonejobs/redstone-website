export type JobImportProvider = "foundrole" | "jobbank";

export type ForeignWorkerStatus =
  | "verified_foreign_recruitment"
  | "international_applicants_accepted"
  | "lmia_requested"
  | "lmia_approved"
  | "sponsorship_confirmed"
  | "sponsorship_unconfirmed"
  | "requires_existing_authorization"
  | "not_suitable"
  | "unknown";

export type ExternalJobCandidate = {
  provider: JobImportProvider;
  externalId: string;
  title: string;
  companyName: string | null;
  country: string;
  city: string | null;
  sourceUrl: string;
  applyUrl?: string | null;
  postedAt?: string | null;
  deadline?: string | null;
  description?: string | null;
  descriptionSnippet?: string | null;
  category?: string | null;
  employmentType?: string | null;
  workLocationType?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: "hour" | "day" | "week" | "month" | "year" | null;
  vacancies?: number | null;
  skills?: string[];
  benefits?: string[];
  sourceTrustGrade?: string | null;
  raw?: Record<string, unknown>;
};

export type ImportClassification = {
  foreignWorkerStatus: ForeignWorkerStatus;
  immigrationEvidence: string | null;
  visaSponsorship: boolean;
  sponsorshipStatus: "included" | "not_included" | "not_confirmed";
  qualityScore: number;
  reject: boolean;
  rejectReason: string | null;
};

export type ImportSourceConfig = {
  provider: JobImportProvider;
  display_name: string;
  enabled: boolean;
  auto_publish_enabled: boolean;
  publish_threshold: number;
  external_apply_only: boolean;
  config: Record<string, unknown> | null;
};

export type ImportRunSummary = {
  provider: JobImportProvider;
  status: "succeeded" | "partial" | "failed" | "skipped";
  fetched: number;
  published: number;
  updated: number;
  duplicates: number;
  rejected: number;
  review: number;
  message?: string;
};
