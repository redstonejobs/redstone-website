"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/admin/auth";
import {
  normalizeEmailContact,
  normalizePhoneContact,
} from "@/lib/referrals/contact-normalization";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";

const CLIENT_STATUSES = [
  "lead",
  "contacted",
  "registered",
  "applied",
  "processing",
  "placed",
  "closed",
] as const;

const CLIENT_SOURCES = [
  "manual",
  "referral_link",
  "walk_in",
  "phone",
  "whatsapp",
  "other",
] as const;

const PASSPORT_STATUSES = ["unknown", "none", "valid", "expired", "processing"] as const;
const MEDICAL_STATUSES = [
  "unknown",
  "not_started",
  "pending",
  "booked",
  "completed",
  "failed",
  "waived",
  "expired",
] as const;

export async function registerOwnStaffClient(formData: FormData) {
  const context = await requireStaff();
  const fullName = text(formData, "full_name");
  const email = nullableText(formData, "email");
  const phone = nullableText(formData, "phone");

  if (!fullName) redirect("/staff/clients/new?error=name_required");
  if (!email && !phone) redirect("/staff/clients/new?error=contact_required");

  const source = option(formData, "source", CLIENT_SOURCES, "manual");
  const supabase = await createClient();

  const normalizedEmail = normalizeEmailContact(email);
  const normalizedPhone = normalizePhoneContact(phone);
  let duplicateCount = 0;

  if (normalizedEmail || normalizedPhone) {
    const { data: candidates } = await supabase
      .from("staff_clients")
      .select("id,email,phone")
      .eq("staff_user_id", context.user.id)
      .limit(100);

    const duplicateIds = new Set<string>();
    for (const row of candidates ?? []) {
      const emailMatches = normalizedEmail && normalizeEmailContact(row.email) === normalizedEmail;
      const phoneMatches = normalizedPhone && normalizePhoneContact(row.phone) === normalizedPhone;
      if ((emailMatches || phoneMatches) && typeof row.id === "string") duplicateIds.add(row.id);
    }
    duplicateCount = duplicateIds.size;
  }

  const { data, error } = await supabase
    .from("staff_clients")
    .insert({
      staff_user_id: context.user.id,
      full_name: fullName,
      email,
      phone,
      nationality: nullableText(formData, "nationality"),
      country: nullableText(formData, "country"),
      interested_job: nullableText(formData, "interested_job"),
      preferred_country: nullableText(formData, "preferred_country"),
      passport_status: option(formData, "passport_status", PASSPORT_STATUSES, "unknown"),
      medical_status: option(formData, "medical_status", MEDICAL_STATUSES, "unknown"),
      follow_up_date: nullableDate(formData, "follow_up_date"),
      status: option(formData, "status", CLIENT_STATUSES, "lead"),
      source,
      notes: nullableText(formData, "notes"),
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data?.id) {
    console.error("[staff] RLS client registration failed", {
      code: error?.code ?? null,
      message: error?.message ?? "No client id returned",
    });
    redirect("/staff/clients/new?error=create_failed");
  }

  try {
    const admin = createAdminClient();
    const { error: auditError } = await admin.from("admin_audit_logs").insert({
      actor_user_id: context.user.id,
      actor_role: "staff",
      action: "staff_client_created",
      entity_type: "staff_client",
      entity_id: data.id,
      description: "Staff CRM client record created.",
      metadata: {
        source,
        duplicate_warning: duplicateCount > 0,
        potential_duplicate_count: duplicateCount,
      },
    });

    if (auditError) {
      console.error("[staff] client registration audit failed", {
        code: auditError.code ?? null,
        message: auditError.message,
      });
    }
  } catch (error) {
    console.error("[staff] client registration audit threw", {
      message: error instanceof Error ? error.message : "Unknown audit error",
    });
  }

  revalidatePath("/staff");
  revalidatePath("/staff/clients");
  redirect(
    duplicateCount > 0
      ? "/staff/clients?created=1&duplicate=1"
      : "/staff/clients?created=1",
  );
}

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

function option<T extends readonly string[]>(
  formData: FormData,
  key: string,
  allowed: T,
  fallback: T[number],
) {
  const value = text(formData, key);
  return allowed.includes(value) ? (value as T[number]) : fallback;
}

function nullableDate(formData: FormData, key: string) {
  const value = text(formData, key);
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}
