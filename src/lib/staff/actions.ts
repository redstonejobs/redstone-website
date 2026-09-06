"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/admin/auth";
import {
  normalizeEmailContact,
  normalizePhoneContact,
} from "@/lib/referrals/contact-normalization";
import { createAdminClient } from "@/utils/supabase/admin";

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

const PASSPORT_STATUSES = [
  "unknown",
  "none",
  "valid",
  "expired",
  "processing",
] as const;

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

/* ============================================================
   HELPERS
============================================================ */

function text(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function nullableText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value || null;
}

function option<T extends readonly string[]>(
  formData: FormData,
  key: string,
  allowed: T,
  fallback: T[number]
) {
  const value = text(formData, key);
  return allowed.includes(value) ? value : fallback;
}

function isClientSource(value: string): value is (typeof CLIENT_SOURCES)[number] {
  return (CLIENT_SOURCES as readonly string[]).includes(value);
}

function isClientStatus(value: string): value is (typeof CLIENT_STATUSES)[number] {
  return (CLIENT_STATUSES as readonly string[]).includes(value);
}

function nullableDate(formData: FormData, key: string) {
  const value = text(formData, key);

  if (!value) return null;

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

function authErrorText(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" ? message : "";
}

function authAccountAlreadyExists(error: unknown) {
  const message = authErrorText(error).toLowerCase();
  return (
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists")
  );
}

async function countPotentialDuplicateStaffClients({
  admin,
  staffUserId,
  email,
  phone,
}: {
  admin: ReturnType<typeof createAdminClient>;
  staffUserId: string;
  email: string | null;
  phone: string | null;
}) {
  const normalizedEmail = normalizeEmailContact(email);
  const normalizedPhone = normalizePhoneContact(phone);

  if (!normalizedEmail && !normalizedPhone) return 0;

  const { data, error } = await admin
    .from("staff_clients")
    .select("id, email, phone")
    .eq("staff_user_id", staffUserId)
    .limit(100);

  if (error) {
    console.error("[staff] duplicate client check failed", {
      code: error.code ?? null,
      message: error.message,
    });
    return 0;
  }

  const matchingIds = new Set<string>();

  for (const row of data ?? []) {
    const rowId = typeof row.id === "string" ? row.id : null;
    if (!rowId) continue;

    const emailMatches =
      normalizedEmail &&
      normalizeEmailContact(row.email) === normalizedEmail;
    const phoneMatches =
      normalizedPhone &&
      normalizePhoneContact(row.phone) === normalizedPhone;

    if (emailMatches || phoneMatches) {
      matchingIds.add(rowId);
    }
  }

  return matchingIds.size;
}

async function writeStaffClientAudit({
  admin,
  actorUserId,
  action,
  clientId,
  metadata,
}: {
  admin: ReturnType<typeof createAdminClient>;
  actorUserId: string;
  action: string;
  clientId: string;
  metadata?: Record<string, string | number | boolean | null>;
}) {
  const { error } = await admin.from("admin_audit_logs").insert({
    actor_user_id: actorUserId,
    actor_role: "staff",
    action,
    entity_type: "staff_client",
    entity_id: clientId,
    description: "Staff CRM client record changed.",
    metadata: metadata ?? {},
  });

  if (error) {
    console.error("[staff] client audit write failed", {
      action,
      code: error.code ?? null,
      message: error.message,
    });
  }
}

/* ============================================================
   UPDATE OWN STAFF PROFILE

   Personnel / employment fields remain controlled by admin.
============================================================ */

export async function updateOwnStaffProfile(
  formData: FormData
) {
  const context = await requireStaff();

  const fullName = text(formData, "full_name");
  const phone = nullableText(formData, "phone");
  const nationality = nullableText(
    formData,
    "nationality"
  );
  const city = nullableText(formData, "city");
  const country = nullableText(formData, "country");

  if (!fullName) {
    throw new Error("Full name is required.");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      phone,
      nationality,
      city,
      country,
      updated_at: new Date().toISOString(),
    })
    .eq("id", context.user.id);

  if (error) {
    throw new Error(
      `Unable to update profile: ${error.message}`
    );
  }

  revalidatePath("/staff");
}

/* ============================================================
   STAFF PROFILE PHOTO
============================================================ */

export async function uploadOwnStaffAvatar(
  formData: FormData
) {
  const context = await requireStaff();

  const file = formData.get("avatar");

  if (!(file instanceof File)) {
    throw new Error("Please select a profile image.");
  }

  if (file.size <= 0) {
    throw new Error("The selected image is empty.");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      "Profile image must not exceed 5 MB."
    );
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Only JPG, PNG and WEBP profile images are allowed."
    );
  }

  const admin = createAdminClient();

  const path =
    `${context.user.id}/profile-photo`;

  const { error: uploadError } =
    await admin.storage
      .from("staff-avatars")
      .upload(path, file, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: true,
      });

  if (uploadError) {
    throw new Error(
      `Unable to upload profile photo: ${uploadError.message}`
    );
  }

  const { data: publicUrlData } =
    admin.storage
      .from("staff-avatars")
      .getPublicUrl(path);

  const { error: profileError } =
    await admin
      .from("profiles")
      .update({
        avatar_url: publicUrlData.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", context.user.id);

  if (profileError) {
    throw new Error(
      `Photo uploaded but profile could not be updated: ${profileError.message}`
    );
  }

  revalidatePath("/staff");
}

/* ============================================================
   CREATE CLIENT / LEAD

   This creates a CRM client record.
   It does NOT create an authentication account for the client.
============================================================ */

export async function createOwnStaffClient(
  formData: FormData
) {
  const context = await requireStaff();

  const fullName = text(formData, "full_name");
  const email = nullableText(formData, "email");
  const phone = nullableText(formData, "phone");

  if (!fullName) {
    throw new Error("Client name is required.");
  }

  if (!email && !phone) {
    throw new Error(
      "Enter at least a phone number or email address."
    );
  }

  const source = nullableText(formData, "source") ?? "manual";

  if (!isClientSource(source)) {
    throw new Error("Invalid client source.");
  }

  const admin = createAdminClient();
  const duplicateCount = await countPotentialDuplicateStaffClients({
    admin,
    staffUserId: context.user.id,
    email,
    phone,
  });

  const { data, error } = await admin
    .from("staff_clients")
    .insert({
      staff_user_id: context.user.id,
      full_name: fullName,
      email,
      phone,
      nationality: nullableText(
        formData,
        "nationality"
      ),
      country: nullableText(formData, "country"),
      interested_job: nullableText(
        formData,
        "interested_job"
      ),
      preferred_country: nullableText(
        formData,
        "preferred_country"
      ),
      passport_status: option(
        formData,
        "passport_status",
        PASSPORT_STATUSES,
        "unknown"
      ),
      medical_status: option(
        formData,
        "medical_status",
        MEDICAL_STATUSES,
        "unknown"
      ),
      follow_up_date: nullableDate(formData, "follow_up_date"),
      status: option(
        formData,
        "status",
        CLIENT_STATUSES,
        "lead"
      ),
      source,
      notes: nullableText(formData, "notes"),
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    console.error("[staff] create client failed", {
      code: error.code ?? null,
      message: error.message,
    });

    throw new Error(
      "Unable to create client right now."
    );
  }

  await writeStaffClientAudit({
    admin,
    actorUserId: context.user.id,
    action: "staff_client_created",
    clientId: data.id,
    metadata: {
      source,
      duplicate_warning: duplicateCount > 0,
      potential_duplicate_count: duplicateCount,
    },
  });

  revalidatePath("/staff");
  revalidatePath("/staff/clients");
  redirect(
    duplicateCount > 0
      ? "/staff/clients?created=1&duplicate=1"
      : "/staff/clients?created=1"
  );
}

/* ============================================================
   CONVERT OWN CRM CLIENT TO CANDIDATE ACCOUNT

   Staff can convert only a client in their own portfolio. The
   candidate receives a Supabase invitation email and the CRM
   record remains linked to the resulting candidate account.
============================================================ */

export async function convertOwnStaffClientToCandidate(
  formData: FormData
) {
  const context = await requireStaff();
  const id = text(formData, "client_id");

  if (!id) {
    throw new Error("Client record is required.");
  }

  const admin = createAdminClient();

  const { data: client, error: clientError } = await admin
    .from("staff_clients")
    .select(
      "id, candidate_user_id, full_name, email, phone, nationality, country, status"
    )
    .eq("id", id)
    .eq("staff_user_id", context.user.id)
    .maybeSingle<{
      id: string;
      candidate_user_id: string | null;
      full_name: string;
      email: string | null;
      phone: string | null;
      nationality: string | null;
      country: string | null;
      status: string | null;
    }>();

  if (clientError || !client) {
    throw new Error("Client record was not found.");
  }

  if (client.candidate_user_id) {
    redirect("/staff/clients?converted=already");
  }

  const email = normalizeEmailContact(client.email);

  if (!email) {
    redirect("/staff/clients?conversion_error=email_required");
  }

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://redstone.co.ke"
  ).replace(/\/+$/, "");
  const callbackUrl = new URL(`${siteUrl}/auth/callback`);
  callbackUrl.searchParams.set("next", "/candidate");

  const { data: invitation, error: inviteError } =
    await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: callbackUrl.toString(),
      data: {
        profile_type: "candidate",
        full_name: client.full_name,
        phone: client.phone ?? "",
        nationality: client.nationality ?? "",
        country: client.country ?? "",
      },
    });

  if (inviteError || !invitation.user) {
    console.error("[staff] candidate invitation failed", {
      client_id: client.id,
      code:
        inviteError && typeof inviteError === "object" && "code" in inviteError
          ? String((inviteError as { code?: unknown }).code ?? "")
          : null,
      message: authErrorText(inviteError) || "No invited user returned.",
    });

    redirect(
      authAccountAlreadyExists(inviteError)
        ? "/staff/clients?conversion_error=account_exists"
        : "/staff/clients?conversion_error=invite_failed"
    );
  }

  const candidateId = invitation.user.id;
  const now = new Date().toISOString();

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      referred_by_staff_id: context.user.id,
      referral_attributed_at: now,
      updated_at: now,
    })
    .eq("id", candidateId)
    .eq("profile_type", "candidate");

  if (profileError) {
    console.error("[staff] candidate ownership link failed", {
      client_id: client.id,
      candidate_id: candidateId,
      code: profileError.code ?? null,
      message: profileError.message,
    });
  }

  const nextStatus = ["lead", "contacted"].includes(client.status ?? "")
    ? "registered"
    : client.status || "registered";

  const { error: linkError } = await admin
    .from("staff_clients")
    .update({
      candidate_user_id: candidateId,
      status: nextStatus,
      updated_at: now,
    })
    .eq("id", client.id)
    .eq("staff_user_id", context.user.id);

  if (linkError) {
    console.error("[staff] candidate CRM link failed", {
      client_id: client.id,
      candidate_id: candidateId,
      code: linkError.code ?? null,
      message: linkError.message,
    });
    throw new Error(
      "Candidate account was invited, but the CRM record could not be linked. Contact an administrator before retrying."
    );
  }

  await writeStaffClientAudit({
    admin,
    actorUserId: context.user.id,
    action: "staff_client_converted_to_candidate",
    clientId: client.id,
    metadata: {
      candidate_user_id: candidateId,
      invitation_email: email,
      new_status: nextStatus,
    },
  });

  revalidatePath("/staff");
  revalidatePath("/staff/clients");
  redirect("/staff/clients?converted=1");
}

/* ============================================================
   DELETE OWN CRM CLIENT RECORD

   This removes only the staff-owned CRM record. A linked
   candidate authentication account, profile and applications are
   intentionally left untouched.
============================================================ */

export async function deleteOwnStaffClient(
  formData: FormData
) {
  const context = await requireStaff();
  const id = text(formData, "client_id");

  if (!id || formData.get("confirm") !== "yes") {
    throw new Error("Confirm the client record deletion.");
  }

  const admin = createAdminClient();
  const { data: existing, error: loadError } = await admin
    .from("staff_clients")
    .select("id, candidate_user_id, full_name, status")
    .eq("id", id)
    .eq("staff_user_id", context.user.id)
    .maybeSingle<{
      id: string;
      candidate_user_id: string | null;
      full_name: string;
      status: string | null;
    }>();

  if (loadError || !existing) {
    throw new Error("Client record was not found.");
  }

  await writeStaffClientAudit({
    admin,
    actorUserId: context.user.id,
    action: "staff_client_deleted",
    clientId: existing.id,
    metadata: {
      candidate_linked: Boolean(existing.candidate_user_id),
      candidate_user_id: existing.candidate_user_id,
      prior_status: existing.status,
      client_name: existing.full_name,
    },
  });

  const { error } = await admin
    .from("staff_clients")
    .delete()
    .eq("id", existing.id)
    .eq("staff_user_id", context.user.id);

  if (error) {
    console.error("[staff] delete client failed", {
      client_id: existing.id,
      code: error.code ?? null,
      message: error.message,
    });
    throw new Error("Unable to delete this client record right now.");
  }

  revalidatePath("/staff");
  revalidatePath("/staff/clients");
  redirect("/staff/clients?deleted=1");
}

/* ============================================================
   UPDATE CLIENT STATUS
============================================================ */

export async function updateOwnClientStatus(
  formData: FormData
) {
  const context = await requireStaff();

  const id = text(formData, "client_id");
  const status = text(formData, "status");

  if (!id || !isClientStatus(status)) {
    throw new Error("Invalid client update.");
  }

  const admin = createAdminClient();

  const { data: existing, error: loadError } = await admin
    .from("staff_clients")
    .select("id, status")
    .eq("id", id)
    .eq("staff_user_id", context.user.id)
    .maybeSingle<{ id: string; status: string | null }>();

  if (loadError) {
    console.error("[staff] load client for status update failed", {
      code: loadError.code ?? null,
      message: loadError.message,
    });

    throw new Error("Unable to update client right now.");
  }

  if (!existing) {
    throw new Error("Client record was not found.");
  }

  const { error } = await admin
    .from("staff_clients")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("staff_user_id", context.user.id);

  if (error) {
    console.error("[staff] update client status failed", {
      code: error.code ?? null,
      message: error.message,
    });

    throw new Error("Unable to update client right now.");
  }

  if (existing.status !== status) {
    await writeStaffClientAudit({
      admin,
      actorUserId: context.user.id,
      action: "staff_client_status_changed",
      clientId: existing.id,
      metadata: {
        from_status: existing.status,
        to_status: status,
      },
    });
  }

  revalidatePath("/staff");
  revalidatePath("/staff/clients");
  redirect("/staff/clients?updated=1");
}
