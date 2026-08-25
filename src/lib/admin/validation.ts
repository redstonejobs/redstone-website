import { isStaffRole } from "./constants";
import { canTransitionEmployerVerification, isJobStatus } from "./workflow";
import { resolveOccupationJobContent, type JobContentCandidate } from "@/lib/jobs/catalogue";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };

export function assertValid<T>(result: ValidationResult<T>) {
  if (!result.ok) {
    throw new Error(result.errors.join(" "));
  }

  return result.value;
}

export function validateStaffRole(role: string) {
  return isStaffRole(role) ? ok(role) : fail("Invalid staff role.");
}

export function validateJobPayload(payload: Record<string, unknown>) {
  const errors: string[] = [];
  const title = stringValue(payload.title);
  const slug = stringValue(payload.slug);
  const status = stringValue(payload.status) || "draft";
  const salaryMin = numberOrNull(payload.salary_min);
  const salaryMax = numberOrNull(payload.salary_max);
  const vacancies = numberOrNull(payload.vacancies);

  if (!title) errors.push("Job title is required.");
  if (!slug) errors.push("Slug is required.");
  if (!isJobStatus(status)) errors.push("Invalid job status.");
  if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) {
    errors.push("Maximum salary must be greater than or equal to minimum salary.");
  }
  if (vacancies !== null && vacancies <= 0) errors.push("Vacancies must be greater than zero.");
  if (payload.salary_period && !["hour", "day", "week", "month", "year"].includes(String(payload.salary_period))) {
    errors.push("Invalid salary period.");
  }
  if (payload.processing_time_unit && !["days", "weeks", "months"].includes(String(payload.processing_time_unit))) {
    errors.push("Invalid processing time unit.");
  }
  if (payload.contract_duration_unit && !["months", "years"].includes(String(payload.contract_duration_unit))) {
    errors.push("Invalid contract duration unit.");
  }
  for (const key of [
    "sponsorship_status",
    "accommodation_status",
    "meals_status",
    "transport_status",
    "medical_insurance_status",
    "air_ticket_status",
    "training_status",
  ]) {
    if (
      payload[key] &&
      !["included", "not_included", "allowance", "employer_specific", "not_confirmed"].includes(String(payload[key]))
    ) {
      errors.push(`Invalid ${key}.`);
    }
  }

  if (payload.application_deadline) {
    const parsed = new Date(String(payload.application_deadline));
    if (Number.isNaN(parsed.getTime())) errors.push("Deadline is not a valid date.");
  }

  return errors.length ? fail(errors) : ok(payload);
}

export function validateJobForPublication(job: Record<string, unknown>) {
  const errors: string[] = [];
  const occupationContent = resolveOccupationJobContent(job as JobContentCandidate);
  const description = stringValue(job.description) || (occupationContent.occupation ? occupationContent.full_description : "");
  const requiredFields = ["title", "slug", "country", "category", "skill_level", "vacancies", "application_deadline"];

  for (const field of requiredFields) {
    if (!job[field]) {
      errors.push(`${field} is required before publication.`);
    }
  }

  if (!description) {
    errors.push("description is required before publication.");
  }

  if (description && description.length < 80) {
    errors.push("Job description must be at least 80 characters before publication.");
  }

  if (job.application_deadline) {
    const deadline = new Date(String(job.application_deadline));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!Number.isNaN(deadline.getTime()) && deadline < today) {
      errors.push("Published jobs cannot have a past deadline.");
    }
  }
  const vacancies = numberOrNull(job.vacancies);
  if (vacancies === null || vacancies <= 0) {
    errors.push("Published jobs require at least one vacancy.");
  }

  return errors.length ? fail(errors) : ok(job);
}

export function validateEmployerPayload(payload: Record<string, unknown>) {
  const errors: string[] = [];
  const email = stringValue(payload.email);
  const website = stringValue(payload.website);
  const status = stringValue(payload.verification_status) || "pending";

  if (!stringValue(payload.company_name)) errors.push("Company name is required.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Enter a valid employer email.");
  if (website) {
    try {
      const url = new URL(website);
      if (!["http:", "https:"].includes(url.protocol)) errors.push("Website must use http or https.");
    } catch {
      errors.push("Enter a valid website URL.");
    }
  }
  if (!["pending", "verified", "rejected"].includes(status)) errors.push("Invalid employer verification status.");

  return errors.length ? fail(errors) : ok(payload);
}

export function validateEmployerTransition(currentStatus: string | null | undefined, nextStatus: string) {
  if (!["pending", "verified", "rejected"].includes(nextStatus)) {
    return fail("Invalid employer verification status.");
  }

  if (!canTransitionEmployerVerification(currentStatus, nextStatus)) {
    return fail(`Employer cannot move from ${currentStatus ?? "unset"} to ${nextStatus}.`);
  }

  return ok(nextStatus);
}

export function sanitizeStoragePath(path: string) {
  const trimmed = path.trim();
  const allowedExtension = /\.(pdf|png|jpe?g|webp|docx?)$/i.test(trimmed);

  if (
    !trimmed ||
    trimmed.startsWith("/") ||
    trimmed.includes("\\") ||
    trimmed.includes("..") ||
    trimmed.split("/").some((part) => !part || part === "." || part === "..") ||
    !/^[A-Za-z0-9/_ .@()-]+$/.test(trimmed) ||
    !allowedExtension
  ) {
    return fail("Document path is not allowed.");
  }

  return ok(trimmed);
}

function ok<T>(value: T): ValidationResult<T> {
  return { ok: true, value };
}

function fail<T = never>(error: string | string[]): ValidationResult<T> {
  return { ok: false, errors: Array.isArray(error) ? error : [error] };
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
