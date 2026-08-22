export const CANDIDATE_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Application Submitted",
  under_review: "Under Review",
  shortlisted: "Shortlisted",
  interview: "Interview Stage",
  employer_review: "Employer Review",
  offer_pending: "Selection Review",
  offer_issued: "Offer Issued",
  documentation: "Documentation",
  visa_processing: "Work Permit / Visa Processing",
  approved: "Approved",
  deployed: "Deployment Complete",
  rejected: "Not Selected",
  withdrawn: "Withdrawn",
};

export const WITHDRAWABLE_STATUSES = [
  "draft",
  "submitted",
  "under_review",
  "shortlisted",
  "interview",
  "employer_review",
  "offer_pending",
];

export const DOCUMENT_TYPES = [
  "cv",
  "passport",
  "national_id",
  "good_conduct",
  "certificate",
  "diploma",
  "degree",
  "medical",
  "photo",
  "reference_letter",
  "employment_letter",
  "visa_document",
  "other",
] as const;

export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
export const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export function candidateStatusLabel(status: string | null | undefined) {
  return CANDIDATE_STATUS_LABELS[status ?? ""] ?? "Status Pending";
}

export function candidateDocumentStatus(status: string | null | undefined) {
  if (status === "verified") return "Verified";
  if (status === "rejected") return "Needs Attention";
  return "Pending Review";
}

