import type { JobOccupation } from "@/lib/jobs/catalogue";

export const BULK_JOB_WARNING =
  "Only publish vacancies that Red Stone is currently authorized to recruit for. Publishing a vacancy makes it visible to applicants on redstone.co.ke.";

export const BULK_JOB_LIMIT = 25;

export function bulkJobFieldName(occupationSlug: string, key: string) {
  return `job_${occupationSlug}_${key}`;
}

export function bulkJobFieldValue(formData: FormData, occupation: JobOccupation, key: string) {
  const entry = formData.get(bulkJobFieldName(occupation.slug, key));
  return typeof entry === "string" ? entry.trim() : "";
}

export function bulkJobCheckboxValue(formData: FormData, occupation: JobOccupation, key: string) {
  return formData.get(bulkJobFieldName(occupation.slug, key)) === "on";
}
