"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireAdmin, requireStaff } from "./auth";

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function optionalNumber(formData: FormData, key: string) {
  const raw = value(formData, key);

  if (!raw) {
    return null;
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`${key} must be zero or greater.`);
  }

  return parsed;
}

function requiredPositiveInteger(formData: FormData, key: string) {
  const parsed = Number(value(formData, key));

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} must be greater than zero.`);
  }

  return parsed;
}

function checkbox(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function jobPayload(formData: FormData, creatorId?: string) {
  const title = value(formData, "title");
  const slug = value(formData, "slug");
  const deadline = value(formData, "deadline");
  const status = value(formData, "status") || "draft";

  if (!title) {
    throw new Error("Job title is required.");
  }

  if (!slug) {
    throw new Error("Slug is required.");
  }

  if (deadline) {
    const deadlineDate = new Date(deadline);

    if (Number.isNaN(deadlineDate.getTime())) {
      throw new Error("Deadline is not a valid date.");
    }
  }

  const payload: Record<string, unknown> = {
    title,
    slug,
    employer_id: value(formData, "employer_id") || null,
    country: value(formData, "country") || null,
    city: value(formData, "city") || null,
    category: value(formData, "category") || null,
    job_type: value(formData, "job_type") || null,
    skill_level: value(formData, "skill_level") || null,
    description: value(formData, "description") || null,
    salary_min: optionalNumber(formData, "salary_min"),
    salary_max: optionalNumber(formData, "salary_max"),
    currency: value(formData, "currency") || null,
    salary_period: value(formData, "salary_period") || null,
    number_of_vacancies: requiredPositiveInteger(formData, "number_of_vacancies"),
    deadline: deadline || null,
    visa_sponsorship: checkbox(formData, "visa_sponsorship"),
    accommodation: checkbox(formData, "accommodation"),
    transport: checkbox(formData, "transport"),
    meals: checkbox(formData, "meals"),
    status,
  };

  if (creatorId) {
    payload.created_by = creatorId;
  }

  if (status === "published") {
    payload.published_at = new Date().toISOString();
  }

  return payload;
}

export async function createJob(formData: FormData) {
  const context = await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("jobs")
    .insert(jobPayload(formData, context.user.id))
    .select("id")
    .single();

  if (error) {
    throw new Error("Unable to create job. Check required fields and your permissions.");
  }

  redirect(`/admin/jobs/${data.id}`);
}

export async function updateJob(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("jobs").update(jobPayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Unable to update job. Check required fields and your permissions.");
  }

  redirect(`/admin/jobs/${id}`);
}

export async function setJobStatus(id: string, status: string) {
  await requireAdmin();
  const supabase = await createClient();
  const payload: Record<string, unknown> = { status };

  if (status === "published") {
    payload.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("jobs").update(payload).eq("id", id);

  if (error) {
    throw new Error("Unable to update job status.");
  }
}

export async function duplicateJob(id: string) {
  const context = await requireAdmin();
  const supabase = await createClient();
  const { data: job, error } = await supabase.from("jobs").select("*").eq("id", id).maybeSingle();

  if (error || !job) {
    throw new Error("Unable to duplicate job.");
  }

  const copy = { ...job } as Record<string, unknown>;
  delete copy.id;
  copy.status = "draft";
  copy.slug = `${String(copy.slug ?? "job")}-copy-${Date.now()}`;
  copy.title = `${String(copy.title ?? "Job")} Copy`;
  copy.created_by = context.user.id;
  copy.published_at = null;

  const { data, error: insertError } = await supabase.from("jobs").insert(copy).select("id").single();

  if (insertError) {
    throw new Error("Unable to duplicate job.");
  }

  redirect(`/admin/jobs/${data.id}/edit`);
}

export async function updateApplicationStatus(id: string, formData: FormData) {
  const context = await requireStaff();
  const status = value(formData, "status");

  if (!status) {
    throw new Error("Status is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("applications")
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      assigned_staff_id: context.user.id,
    })
    .eq("id", id);

  if (error) {
    throw new Error("Unable to update application status.");
  }
}

