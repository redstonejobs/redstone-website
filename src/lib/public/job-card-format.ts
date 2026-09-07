type JobCardFormatInput = {
  contract_type?: string | null;
  contract_duration_value?: number | null;
  contract_duration_unit?: string | null;
  contract_note?: string | null;
  processing_time_min?: number | null;
  processing_time_max?: number | null;
  processing_time_unit?: string | null;
  processing_time_note?: string | null;
};

const SKILL_LEVEL_LABELS: Record<string, string> = {
  unskilled: "Entry Level",
  semi_skilled: "Semi-Skilled",
  skilled: "Skilled",
  professional: "Professional",
};

export function skillLevelLabel(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  return SKILL_LEVEL_LABELS[value] ?? labelFromKey(value);
}

export function formatCardContract(job: JobCardFormatInput) {
  const type = text(job.contract_type);
  const duration = number(job.contract_duration_value);
  const unit = text(job.contract_duration_unit);
  const note = text(job.contract_note);

  if (type === "Permanent") return note ? `Permanent (${note})` : "Permanent";
  if (duration !== null && unit) {
    return `${duration} ${unit}${type ? `, ${type}` : ""}${note ? ` (${note})` : ""}`;
  }
  if (type) return note ? `${type} (${note})` : type;
  return "To be confirmed";
}

export function formatCardProcessingTime(job: JobCardFormatInput) {
  const min = number(job.processing_time_min);
  const max = number(job.processing_time_max);
  const unit = text(job.processing_time_unit);
  const note = text(job.processing_time_note);

  if (min !== null && max !== null && unit) return `${min}-${max} ${unit}${note ? ` (${note})` : ""}`;
  if (min !== null && unit) return `${min} ${unit}${note ? ` (${note})` : ""}`;
  if (note) return note;
  return "Processing time varies by employer and immigration process.";
}

export function formatCardDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function labelFromKey(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function number(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
