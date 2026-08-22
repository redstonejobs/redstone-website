"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { logAuditEvent } from "./audit";
import {
  canChangeApplicationStatus,
  canManageEmployer,
  canManageStaff,
  canReviewDocuments,
  requireAdmin,
  requireStaff,
  requireSuperAdmin,
} from "./auth";
import { APPLICATION_STATUSES } from "./status";

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

function requireConfirmation(formData: FormData) {
  if (formData.get("confirm") !== "yes") {
    throw new Error("Confirmation is required.");
  }
}

function uuidValue(formData: FormData, key: string) {
  const raw = value(formData, key);
  return raw || null;
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

  await logAuditEvent(context, {
    action: "job_created",
    entityType: "job",
    entityId: data.id,
    description: "Job created",
  });

  redirect(`/admin/jobs/${data.id}`);
}

export async function updateJob(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("jobs").update(jobPayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Unable to update job. Check required fields and your permissions.");
  }

  await logAuditEvent(await requireAdmin(), {
    action: "job_updated",
    entityType: "job",
    entityId: id,
    description: "Job updated",
  });

  redirect(`/admin/jobs/${id}`);
}

export async function setJobStatus(id: string, status: string) {
  const context = await requireAdmin();
  const supabase = await createClient();
  const payload: Record<string, unknown> = { status };

  if (status === "published") {
    payload.published_at = new Date().toISOString();
  }

  const { error } = await supabase.from("jobs").update(payload).eq("id", id);

  if (error) {
    throw new Error("Unable to update job status.");
  }

  await logAuditEvent(context, {
    action: status === "published" ? "job_published" : status === "closed" ? "job_closed" : "job_updated",
    entityType: "job",
    entityId: id,
    description: `Job status changed to ${status}`,
  });
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

  if (!canChangeApplicationStatus(context) || !APPLICATION_STATUSES.includes(status as never)) {
    throw new Error("You are not allowed to set this application status.");
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

  await logAuditEvent(context, {
    action: "application_status_changed",
    entityType: "application",
    entityId: id,
    description: `Application status changed to ${status}`,
  });
}

export async function assignApplication(id: string, formData: FormData) {
  const context = await requireStaff();
  const staffId = uuidValue(formData, "assigned_staff_id");

  if (!canChangeApplicationStatus(context) || !staffId) {
    throw new Error("You are not allowed to assign this application.");
  }

  const supabase = await createClient();
  const { data: role } = await supabase
    .from("staff_roles")
    .select("id")
    .eq("user_id", staffId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!role) {
    throw new Error("Target staff member is not active.");
  }

  const { error } = await supabase.from("applications").update({ assigned_staff_id: staffId }).eq("id", id);

  if (error) {
    throw new Error("Unable to assign application.");
  }

  await logAuditEvent(context, {
    action: "application_assigned",
    entityType: "application",
    entityId: id,
    description: "Application assigned",
    metadata: { assigned_staff_id: staffId },
  });
}

export async function addApplicationNote(id: string, formData: FormData) {
  const context = await requireStaff();
  const note = value(formData, "note");

  if (!note) {
    throw new Error("Note is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("application_notes").insert({
    application_id: id,
    note,
    created_by: context.user.id,
  });

  if (error) {
    throw new Error("Unable to save application note.");
  }

  await logAuditEvent(context, {
    action: "application_note_created",
    entityType: "application",
    entityId: id,
    description: "Application note created",
  });
}

export async function addCandidateNote(candidateId: string, formData: FormData) {
  const context = await requireStaff();
  const note = value(formData, "note");

  if (!note) {
    throw new Error("Note is required.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("candidate_notes").insert({
    candidate_id: candidateId,
    note,
    created_by: context.user.id,
  });

  if (error) {
    throw new Error("Unable to save candidate note.");
  }

  await logAuditEvent(context, {
    action: "candidate_note_created",
    entityType: "candidate",
    entityId: candidateId,
    description: "Candidate note created",
  });
}

function employerPayload(formData: FormData) {
  const email = value(formData, "email");
  const website = value(formData, "website");

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid employer email.");
  }

  if (website) {
    try {
      new URL(website);
    } catch {
      throw new Error("Enter a valid website URL.");
    }
  }

  return {
    company_name: value(formData, "company_name"),
    registration_number: value(formData, "registration_number") || null,
    website: website || null,
    email: email || null,
    phone: value(formData, "phone") || null,
    country: value(formData, "country") || null,
    city: value(formData, "city") || null,
    address: value(formData, "address") || null,
    description: value(formData, "description") || null,
    verification_status: value(formData, "verification_status") || "pending",
    is_active: formData.get("is_active") !== "off",
    owner_user_id: uuidValue(formData, "owner_user_id"),
  };
}

export async function createEmployer(formData: FormData) {
  const context = await requireAdmin();

  if (!canManageEmployer(context)) {
    throw new Error("You are not allowed to create employers.");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.from("employers").insert(employerPayload(formData)).select("id").single();

  if (error) {
    throw new Error("Unable to create employer.");
  }

  await logAuditEvent(context, {
    action: "employer_created",
    entityType: "employer",
    entityId: data.id,
    description: "Employer created",
  });

  redirect(`/admin/employers/${data.id}`);
}

export async function updateEmployer(id: string, formData: FormData) {
  const context = await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("employers").update(employerPayload(formData)).eq("id", id);

  if (error) {
    throw new Error("Unable to update employer.");
  }

  await logAuditEvent(context, {
    action: "employer_updated",
    entityType: "employer",
    entityId: id,
    description: "Employer updated",
  });

  redirect(`/admin/employers/${id}`);
}

export async function setEmployerState(id: string, state: "verified" | "rejected" | "suspended" | "reactivated", formData: FormData) {
  requireConfirmation(formData);
  const context = await requireAdmin();
  const supabase = await createClient();
  const current = await supabase.from("employers").select("id").eq("id", id).maybeSingle();

  if (!current.data) {
    throw new Error("Employer was not found.");
  }

  const payload =
    state === "suspended"
      ? { is_active: false }
      : state === "reactivated"
        ? { is_active: true }
        : { verification_status: state };
  const { error } = await supabase.from("employers").update(payload).eq("id", id);

  if (error) {
    throw new Error("Unable to update employer status.");
  }

  await logAuditEvent(context, {
    action: `employer_${state}`,
    entityType: "employer",
    entityId: id,
    description: `Employer ${state}`,
  });
}

export async function verifyDocument(id: string, formData: FormData) {
  requireConfirmation(formData);
  const context = await requireStaff();

  if (!canReviewDocuments(context)) {
    throw new Error("You are not allowed to verify documents.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("application_documents")
    .update({
      verification_status: "verified",
      verified_by: context.user.id,
      verified_at: new Date().toISOString(),
      verification_note: value(formData, "verification_note") || null,
    })
    .eq("id", id);

  if (error) {
    throw new Error("Unable to verify document.");
  }

  await logAuditEvent(context, {
    action: "document_verified",
    entityType: "application_document",
    entityId: id,
    description: "Document verified",
  });
}

export async function rejectDocument(id: string, formData: FormData) {
  requireConfirmation(formData);
  const context = await requireStaff();

  if (!canReviewDocuments(context)) {
    throw new Error("You are not allowed to reject documents.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("application_documents")
    .update({
      verification_status: "rejected",
      verified_by: context.user.id,
      verified_at: new Date().toISOString(),
      verification_note: value(formData, "verification_note") || null,
    })
    .eq("id", id);

  if (error) {
    throw new Error("Unable to reject document.");
  }

  await logAuditEvent(context, {
    action: "document_rejected",
    entityType: "application_document",
    entityId: id,
    description: "Document rejected",
  });
}

export async function assignStaffRole(targetUserId: string, formData: FormData) {
  const context = await requireAdmin();
  const role = value(formData, "role");

  if (!canManageStaff(context) || context.user.id === targetUserId) {
    throw new Error("You are not allowed to assign this role.");
  }

  if (!["staff", "moderator", "recruiter", "hr", "finance", "admin", "super_admin"].includes(role)) {
    throw new Error("Invalid role.");
  }

  if (role === "super_admin") {
    await requireSuperAdmin();
  }

  const supabase = await createClient();
  const { error } = await supabase.from("staff_roles").insert({
    user_id: targetUserId,
    role,
    active: true,
  });

  if (error) {
    throw new Error("Unable to assign staff role.");
  }

  await logAuditEvent(context, {
    action: "staff_role_assigned",
    entityType: "staff_role",
    description: `Assigned ${role}`,
    metadata: { target_user_id: targetUserId, role },
  });
}

export async function revokeStaffRole(roleId: string, formData: FormData) {
  requireConfirmation(formData);
  const context = await requireAdmin();
  const supabase = await createClient();
  const { data: targetRole } = await supabase.from("staff_roles").select("id, user_id, role, active").eq("id", roleId).maybeSingle();

  if (!targetRole) {
    throw new Error("Role not found.");
  }

  if (targetRole.user_id === context.user.id) {
    throw new Error("You cannot revoke your own role.");
  }

  if (targetRole.role === "super_admin") {
    await requireSuperAdmin();
    const { count } = await supabase
      .from("staff_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("active", true);

    if ((count ?? 0) <= 1) {
      throw new Error("Cannot revoke the final active super admin.");
    }
  }

  const { error } = await supabase.from("staff_roles").update({ active: false }).eq("id", roleId);

  if (error) {
    throw new Error("Unable to revoke role.");
  }

  await logAuditEvent(context, {
    action: "staff_role_revoked",
    entityType: "staff_role",
    entityId: roleId,
    description: `Revoked ${targetRole.role}`,
  });
}
