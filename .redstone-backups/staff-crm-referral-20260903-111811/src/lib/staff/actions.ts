"use server";

import { revalidatePath } from "next/cache";

import { requireStaff } from "@/lib/admin/auth";
import { createAdminClient } from "@/utils/supabase/admin";

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

  const admin = createAdminClient();

  const { error } = await admin
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
      status: "lead",
      source:
        nullableText(formData, "source") ??
        "manual",
      notes: nullableText(formData, "notes"),
    });

  if (error) {
    throw new Error(
      `Unable to create client: ${error.message}`
    );
  }

  revalidatePath("/staff");
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

  const allowed = [
    "lead",
    "contacted",
    "registered",
    "applied",
    "processing",
    "placed",
    "closed",
  ];

  if (!id || !allowed.includes(status)) {
    throw new Error("Invalid client update.");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("staff_clients")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("staff_user_id", context.user.id);

  if (error) {
    throw new Error(
      `Unable to update client: ${error.message}`
    );
  }

  revalidatePath("/staff");
}