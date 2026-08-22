import { ALLOWED_DOCUMENT_MIME_TYPES, DOCUMENT_TYPES, MAX_DOCUMENT_BYTES } from "./constants";

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateRegistration(raw: Record<string, FormDataEntryValue>) {
  const value = {
    full_name: text(raw.full_name),
    email: text(raw.email).toLowerCase(),
    password: text(raw.password),
    confirm_password: text(raw.confirm_password),
    phone: text(raw.phone),
    nationality: text(raw.nationality),
    date_of_birth: text(raw.date_of_birth),
    city: text(raw.city),
    country: text(raw.country),
    privacy: text(raw.privacy),
    terms: text(raw.terms),
  };

  if (value.full_name.length < 2) return fail("Full name is required.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return fail("Enter a valid email address.");
  if (value.password.length < 8) return fail("Password must be at least 8 characters.");
  if (value.password !== value.confirm_password) return fail("Passwords do not match.");
  if (!value.phone || !value.nationality || !value.city || !value.country) return fail("Please complete all required profile fields.");
  if (!value.date_of_birth || Number.isNaN(new Date(value.date_of_birth).getTime())) return fail("Enter a valid date of birth.");
  if (value.privacy !== "on" || value.terms !== "on") return fail("Please acknowledge the privacy policy and terms.");

  return ok(value);
}

export function validateResetEmail(email: string): Result<string> {
  const clean = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) ? ok(clean) : fail("Enter a valid email address.");
}

export function validateProfile(raw: FormData) {
  const value = {
    full_name: formText(raw, "full_name"),
    phone: formText(raw, "phone"),
    nationality: formText(raw, "nationality"),
    date_of_birth: formText(raw, "date_of_birth"),
    city: formText(raw, "city"),
    country: formText(raw, "country"),
  };

  if (value.full_name.length < 2) return fail("Full name is required.");
  if (!value.phone || !value.nationality || !value.city || !value.country) return fail("Please complete all required profile fields.");
  if (!value.date_of_birth || Number.isNaN(new Date(value.date_of_birth).getTime())) return fail("Enter a valid date of birth.");
  return ok(value);
}

export function validateApplicationDraft(raw: FormData) {
  const value = {
    cover_letter: formText(raw, "cover_letter"),
    relevant_experience: formText(raw, "relevant_experience"),
    availability: formText(raw, "availability"),
    candidate_message: formText(raw, "candidate_message"),
  };

  if (value.cover_letter.length < 20) return fail("Cover letter must be at least 20 characters.");
  if (value.relevant_experience.length < 10) return fail("Relevant experience must be at least 10 characters.");
  return ok(value);
}

export function validateDocumentUpload(file: File | null, documentType: string) {
  if (!DOCUMENT_TYPES.includes(documentType as never)) return fail("Choose a valid document type.");
  if (!file || file.size === 0) return fail("Choose a file to upload.");
  if (file.size > MAX_DOCUMENT_BYTES) return fail("Documents must be 10 MB or smaller.");
  if (!ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type)) return fail("Only PDF, JPEG, PNG and WebP documents are allowed.");
  return ok({ file, documentType });
}

export function normalizeFileName(name: string) {
  const clean = name.replace(/[^A-Za-z0-9._-]+/g, "-").replace(/-+/g, "-").slice(0, 120);
  return clean || `document-${Date.now()}`;
}

function text(value: FormDataEntryValue | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

function formText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

function fail<T = never>(error: string): Result<T> {
  return { ok: false, error };
}

