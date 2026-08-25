export const BULK_JOB_WARNING =
  "Only publish vacancies that Red Stone is currently authorized to recruit for. Publishing a vacancy makes it visible to applicants on redstone.co.ke.";

export const BULK_JOB_LIMIT = 200;

export function bulkJobFieldName(draftKey: string, key: string) {
  return `job_${draftKey}_${key}`;
}

export function bulkJobFieldValue(formData: FormData, draftKey: string, key: string) {
  const entry = formData.get(bulkJobFieldName(draftKey, key));
  return typeof entry === "string" ? entry.trim() : "";
}

export function bulkJobCheckboxValue(formData: FormData, draftKey: string, key: string) {
  return formData.get(bulkJobFieldName(draftKey, key)) === "on";
}
