import { BENEFIT_STATUSES, JOB_CATEGORIES, SALARY_PERIODS, SKILL_LEVELS } from "@/lib/jobs/catalogue";
import { EMPLOYER_DECISIONS } from "./constants";
import type { EmployerActionResult } from "./types";

export function validateEmployerRegistration(raw: Record<string, unknown>) {
  const value = {
    company_name: text(raw.company_name),
    contact_name: text(raw.contact_name),
    email: text(raw.email).toLowerCase(),
    password: text(raw.password),
    confirm_password: text(raw.confirm_password),
    phone: text(raw.phone),
    country: text(raw.country),
    city: text(raw.city),
    website: text(raw.website),
    registration_number: text(raw.registration_number),
    company_type: text(raw.company_type),
    industry: text(raw.industry),
    company_size: text(raw.company_size),
    privacy: raw.privacy === "on",
    terms: raw.terms === "on",
  };

  if (!value.company_name || !value.contact_name || !value.email || !value.password || !value.phone || !value.country || !value.city || !value.registration_number || !value.industry) {
    return fail("Please complete all required employer registration fields.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return fail("Enter a valid business email.");
  if (value.password.length < 8) return fail("Password must be at least 8 characters.");
  if (value.password !== value.confirm_password) return fail("Passwords do not match.");
  if (!value.privacy || !value.terms) return fail("Please accept the privacy and terms acknowledgements.");

  return ok(value);
}

export function validateEmployerProfile(raw: Record<string, unknown>) {
  const value = {
    company_name: text(raw.company_name),
    registration_number: text(raw.registration_number),
    website: text(raw.website),
    email: text(raw.email).toLowerCase(),
    phone: text(raw.phone),
    country: text(raw.country),
    city: text(raw.city),
    address: text(raw.address),
    description: text(raw.description),
    company_type: text(raw.company_type),
    industry: text(raw.industry),
    company_size: text(raw.company_size),
    primary_contact_name: text(raw.primary_contact_name),
    primary_contact_position: text(raw.primary_contact_position),
    recruitment_needs: text(raw.recruitment_needs),
    preferred_job_categories: text(raw.preferred_job_categories),
  };

  if (!value.company_name || !value.email || !value.phone || !value.country || !value.city) return fail("Company name, email, phone, country and city are required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return fail("Enter a valid company email.");
  return ok(value);
}

export function validateVacancyRequest(raw: Record<string, unknown>, submit = false) {
  const salaryMin = numberOrNull(raw.salary_min);
  const salaryMax = numberOrNull(raw.salary_max);
  const vacancies = numberOrNull(raw.vacancies);
  const value = {
    title: text(raw.title),
    country: text(raw.country),
    city: text(raw.city),
    category: text(raw.category),
    job_type: text(raw.job_type),
    skill_level: text(raw.skill_level),
    short_description: text(raw.short_description),
    description: text(raw.description),
    responsibilities: text(raw.responsibilities),
    requirements: text(raw.requirements),
    experience_requirements: text(raw.experience_requirements),
    education_requirements: text(raw.education_requirements),
    language_requirements: text(raw.language_requirements),
    salary_min: salaryMin,
    salary_max: salaryMax,
    currency: text(raw.currency),
    salary_period: text(raw.salary_period),
    salary_confirmed: raw.salary_confirmed === "on",
    contract_type: text(raw.contract_type),
    contract_duration_value: numberOrNull(raw.contract_duration_value),
    contract_duration_unit: text(raw.contract_duration_unit),
    working_hours_per_week: numberOrNull(raw.working_hours_per_week),
    work_schedule: text(raw.work_schedule),
    vacancies,
    requested_application_deadline: text(raw.requested_application_deadline),
    sponsorship_status: benefit(raw.sponsorship_status),
    accommodation_status: benefit(raw.accommodation_status),
    meals_status: benefit(raw.meals_status),
    transport_status: benefit(raw.transport_status),
    medical_insurance_status: benefit(raw.medical_insurance_status),
    air_ticket_status: benefit(raw.air_ticket_status),
    required_documents: text(raw.required_documents).split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean),
    notes_to_red_stone: text(raw.notes_to_red_stone),
  };

  if (!value.title) return fail("Job title is required.");
  if (salaryMin !== null && salaryMax !== null && salaryMax < salaryMin) return fail("Maximum salary must be greater than or equal to minimum salary.");
  if (vacancies !== null && vacancies <= 0) return fail("Vacancies must be greater than zero.");
  if (value.salary_period && !SALARY_PERIODS.some((period) => period.value === value.salary_period)) return fail("Invalid salary period.");
  if (value.category && !(JOB_CATEGORIES as readonly string[]).includes(value.category)) return fail("Invalid job category.");
  if (value.skill_level && !SKILL_LEVELS.some((level) => level.value === value.skill_level)) return fail("Invalid skill level.");

  if (submit) {
    for (const key of ["country", "category", "skill_level", "description", "vacancies", "requested_application_deadline"] as const) {
      if (!value[key]) return fail(`${key.replaceAll("_", " ")} is required before submission.`);
    }
  }

  return ok(value);
}

export function validateEmployerDecision(raw: Record<string, unknown>) {
  const value = {
    decision: text(raw.decision),
    note: text(raw.note),
  };

  if (!(EMPLOYER_DECISIONS as readonly string[]).includes(value.decision)) return fail("Invalid employer decision.");
  return ok(value);
}

export function validateInterviewRequest(raw: Record<string, unknown>) {
  const value = {
    preferred_times: text(raw.preferred_times),
    timezone: text(raw.timezone),
    method: text(raw.method),
    interviewer_name: text(raw.interviewer_name),
    interviewer_contact: text(raw.interviewer_contact),
    notes_to_red_stone: text(raw.notes_to_red_stone),
  };

  if (!value.preferred_times) return fail("Preferred interview times are required.");
  return ok(value);
}

function benefit(value: unknown) {
  const textValue = text(value) || "not_confirmed";
  return BENEFIT_STATUSES.some((status) => status.value === textValue) ? textValue : "not_confirmed";
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberOrNull(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function ok<T>(value: T): EmployerActionResult<T> {
  return { ok: true, value };
}

function fail<T = never>(error: string): EmployerActionResult<T> {
  return { ok: false, error };
}
