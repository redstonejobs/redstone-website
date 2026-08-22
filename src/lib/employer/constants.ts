export const EMPLOYER_JOB_STATUSES = [
  "employer_draft",
  "submitted_for_review",
  "under_review",
  "changes_requested",
  "approved",
  "rejected",
  "published",
  "paused",
  "closed",
  "archived",
] as const;

export const EMPLOYER_DECISIONS = [
  "pending",
  "reviewing",
  "shortlisted",
  "interview_requested",
  "selected",
  "not_selected",
  "on_hold",
] as const;

export const EMPLOYER_INTERVIEW_STATUSES = ["requested", "scheduled", "completed", "cancelled", "reschedule_requested"] as const;

export const EMPLOYER_VERIFICATION_DOCUMENTS = [
  "certificate_of_incorporation",
  "business_registration",
  "tax_registration",
  "operating_licence",
  "company_profile",
  "authorized_representative_id",
  "recruitment_authorization",
  "other",
] as const;

export function employerStatusLabel(status: unknown) {
  return String(status ?? "pending").replaceAll("_", " ");
}
