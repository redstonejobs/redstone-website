"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/utils/supabase/admin";
import { logAuditEvent } from "./audit";
import {
  canManageStaff,
  requireAdmin,
  requireSuperAdmin,
} from "./auth";

function requirePermanentDeleteConfirmation(formData: FormData) {
  if (formData.get("confirm") !== "yes") {
    throw new Error("Confirmation is required.");
  }

  if (formData.get("delete_confirmation") !== "DELETE") {
    throw new Error('Type DELETE to confirm permanent staff deletion.');
  }
}

async function countOwnedRows(
  admin: ReturnType<typeof createAdminClient>,
  table: string,
  column: string,
  userId: string,
) {
  const { count, error } = await admin
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq(column, userId);

  if (error) {
    throw new Error(`Unable to verify ${table} before deletion.`);
  }

  return count ?? 0;
}

/**
 * Permanently removes a Red Stone staff authentication account and personnel
 * profile while preserving business history wherever the schema permits it.
 *
 * Regular admins may permanently delete ordinary staff. Deleting another
 * administrator or Super Administrator requires a Super Administrator.
 */
export async function permanentlyDeleteStaffAccount(
  targetUserId: string,
  formData: FormData,
) {
  requirePermanentDeleteConfirmation(formData);

  const context = await requireAdmin();

  if (!canManageStaff(context)) {
    throw new Error("You are not allowed to permanently delete staff accounts.");
  }

  if (context.user.id === targetUserId) {
    throw new Error("You cannot permanently delete your own account.");
  }

  const admin = createAdminClient();

  const [profileResult, rolesResult] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, profile_type, staff_id, is_active")
      .eq("id", targetUserId)
      .maybeSingle<{
        id: string;
        full_name: string | null;
        profile_type: string | null;
        staff_id: string | null;
        is_active: boolean | null;
      }>(),
    admin
      .from("staff_roles")
      .select("id, role, active")
      .eq("user_id", targetUserId),
  ]);

  if (profileResult.error) {
    throw new Error("Unable to verify the staff personnel record.");
  }

  if (rolesResult.error) {
    throw new Error("Unable to verify the staff authorization record.");
  }

  const targetProfile = profileResult.data;
  const targetRoles = rolesResult.data ?? [];

  if (!targetProfile) {
    throw new Error("Staff account not found.");
  }

  const isStaffProfile = [
    "staff",
    "moderator",
    "recruiter",
    "hr",
    "finance",
    "admin",
    "super_admin",
  ].includes(String(targetProfile.profile_type ?? ""));

  if (!isStaffProfile && targetRoles.length === 0) {
    throw new Error("The selected account is not a Red Stone staff account.");
  }

  const activeTargetRoles = targetRoles.filter((role) => role.active !== false);
  const targetsAdministrator = activeTargetRoles.some(
    (role) => role.role === "admin" || role.role === "super_admin",
  );
  const targetsSuperAdmin = activeTargetRoles.some(
    (role) => role.role === "super_admin",
  );

  if (targetsAdministrator) {
    await requireSuperAdmin();
  }

  if (targetsSuperAdmin) {
    const { count, error } = await admin
      .from("staff_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "super_admin")
      .eq("active", true);

    if (error) {
      throw new Error("Unable to verify Super Administrator coverage.");
    }

    if ((count ?? 0) <= 1) {
      throw new Error("Cannot permanently delete the final active Super Administrator.");
    }
  }

  // A staff member can technically also have candidate-owned records. Those
  // records cascade with auth/profile deletion, so block rather than destroy
  // candidate applications, documents, notes or payments silently.
  const [
    candidateApplications,
    candidatePayments,
    candidateDocuments,
    candidateNotes,
  ] = await Promise.all([
    countOwnedRows(admin, "applications", "candidate_id", targetUserId),
    countOwnedRows(admin, "application_payments", "candidate_id", targetUserId),
    countOwnedRows(admin, "application_documents", "candidate_id", targetUserId),
    countOwnedRows(admin, "candidate_notes", "candidate_id", targetUserId),
  ]);

  if (
    candidateApplications > 0 ||
    candidatePayments > 0 ||
    candidateDocuments > 0 ||
    candidateNotes > 0
  ) {
    throw new Error(
      "This staff account also owns candidate application records. Transfer or resolve those candidate records before permanent deletion.",
    );
  }

  // Preserve CRM clients that would otherwise CASCADE-delete with the staff
  // auth user. If a unique assignment conflict exists, abort before deletion.
  const { data: clientRows, error: clientLookupError } = await admin
    .from("staff_clients")
    .select("id")
    .eq("staff_user_id", targetUserId)
    .returns<{ id: string }[]>();

  if (clientLookupError) {
    throw new Error("Unable to verify the staff client portfolio.");
  }

  const clientIds = (clientRows ?? []).map((row) => row.id);

  // application_payment_waivers.waived_by is RESTRICT/NOT NULL, so preserve
  // those records by transferring attribution to the deleting administrator.
  const { data: waiverRows, error: waiverLookupError } = await admin
    .from("application_payment_waivers")
    .select("id")
    .eq("waived_by", targetUserId)
    .returns<{ id: string }[]>();

  if (waiverLookupError) {
    throw new Error("Unable to verify payment-waiver history.");
  }

  const waiverIds = (waiverRows ?? []).map((row) => row.id);

  if (clientIds.length > 0) {
    const { error } = await admin
      .from("staff_clients")
      .update({ staff_user_id: context.user.id })
      .in("id", clientIds);

    if (error) {
      throw new Error(
        "Unable to preserve this staff member's client portfolio. Reassign their clients before permanent deletion.",
      );
    }
  }

  if (waiverIds.length > 0) {
    const { error } = await admin
      .from("application_payment_waivers")
      .update({ waived_by: context.user.id })
      .in("id", waiverIds);

    if (error) {
      if (clientIds.length > 0) {
        await admin
          .from("staff_clients")
          .update({ staff_user_id: targetUserId })
          .in("id", clientIds);
      }

      throw new Error("Unable to preserve payment-waiver history before deletion.");
    }
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(targetUserId);

  if (deleteError) {
    // Best-effort rollback of ownership transfers because auth deletion did not
    // complete. Never leave business records silently reassigned on failure.
    if (clientIds.length > 0) {
      await admin
        .from("staff_clients")
        .update({ staff_user_id: targetUserId })
        .in("id", clientIds);
    }

    if (waiverIds.length > 0) {
      await admin
        .from("application_payment_waivers")
        .update({ waived_by: targetUserId })
        .in("id", waiverIds);
    }

    throw new Error(`Unable to permanently delete the staff account: ${deleteError.message}`);
  }

  await logAuditEvent(context, {
    action: "staff_account_permanently_deleted",
    entityType: "staff_account",
    entityId: targetUserId,
    description: `Permanently deleted staff account: ${
      targetProfile.full_name || targetProfile.staff_id || targetUserId
    }`,
    metadata: {
      target_user_id: targetUserId,
      target_staff_id: targetProfile.staff_id,
      target_profile_type: targetProfile.profile_type,
      roles: targetRoles.map((role) => role.role),
      transferred_client_records: clientIds.length,
      transferred_payment_waivers: waiverIds.length,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/staff");
  revalidatePath("/admin/applications");
  revalidatePath("/admin/clients");

  redirect("/admin/staff?deleted=1");
}
