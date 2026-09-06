"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireStaff } from "@/lib/admin/auth";
import { createAdminClient } from "@/utils/supabase/admin";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function staffOwnsCandidate(
  admin: ReturnType<typeof createAdminClient>,
  staffUserId: string,
  candidateId: string
) {
  const [{ data: crmLink }, { data: referralLink }] = await Promise.all([
    admin
      .from("staff_clients")
      .select("id")
      .eq("staff_user_id", staffUserId)
      .eq("candidate_user_id", candidateId)
      .limit(1)
      .maybeSingle<{ id: string }>(),
    admin
      .from("profiles")
      .select("id")
      .eq("id", candidateId)
      .eq("referred_by_staff_id", staffUserId)
      .maybeSingle<{ id: string }>(),
  ]);

  return Boolean(crmLink || referralLink);
}

export async function deleteOwnStaffApplication(formData: FormData) {
  const context = await requireStaff();
  const applicationId = text(formData, "application_id");

  if (!applicationId || formData.get("confirm") !== "yes") {
    redirect("/staff/applications?delete_error=confirmation");
  }

  const admin = createAdminClient();

  const { data: application, error: applicationError } = await admin
    .from("applications")
    .select("id, candidate_id, job_id, status, assigned_staff_id")
    .eq("id", applicationId)
    .maybeSingle<{
      id: string;
      candidate_id: string;
      job_id: string | null;
      status: string | null;
      assigned_staff_id: string | null;
    }>();

  if (applicationError || !application) {
    redirect("/staff/applications?delete_error=not_found");
  }

  const assignedToStaff = application.assigned_staff_id === context.user.id;
  const ownsCandidate = assignedToStaff
    ? true
    : await staffOwnsCandidate(admin, context.user.id, application.candidate_id);

  if (!ownsCandidate) {
    console.warn("[staff] blocked application deletion outside portfolio", {
      actor_user_id: context.user.id,
      application_id: application.id,
    });
    redirect("/staff/applications?delete_error=not_allowed");
  }

  // Preserve financial records. Staff must never remove an application after
  // any payment record has been created, including failed/pending attempts.
  const { data: paymentRecord, error: paymentError } = await admin
    .from("application_payments")
    .select("id, status")
    .eq("application_id", application.id)
    .limit(1)
    .maybeSingle<{ id: string; status: string | null }>();

  if (paymentError) {
    console.error("[staff] application payment guard failed", {
      application_id: application.id,
      code: paymentError.code ?? null,
      message: paymentError.message,
    });
    redirect("/staff/applications?delete_error=blocked");
  }

  if (paymentRecord) {
    redirect("/staff/applications?delete_error=payment_record");
  }

  const { data: documents } = await admin
    .from("application_documents")
    .select("storage_path")
    .eq("application_id", application.id)
    .returns<{ storage_path: string | null }[]>();

  const { error: deleteError } = await admin
    .from("applications")
    .delete()
    .eq("id", application.id)
    .eq("candidate_id", application.candidate_id);

  if (deleteError) {
    console.error("[staff] application deletion failed", {
      actor_user_id: context.user.id,
      application_id: application.id,
      code: deleteError.code ?? null,
      message: deleteError.message,
    });
    redirect("/staff/applications?delete_error=blocked");
  }

  const storagePaths = (documents ?? [])
    .map((row) => row.storage_path)
    .filter((value): value is string => Boolean(value));

  if (storagePaths.length > 0) {
    const { error: storageError } = await admin.storage
      .from("candidate-documents")
      .remove(storagePaths);

    if (storageError) {
      console.warn("[staff] deleted application has orphaned document storage", {
        application_id: application.id,
        code: storageError.name ?? null,
        message: storageError.message,
      });
    }
  }

  const { error: auditError } = await admin.from("admin_audit_logs").insert({
    actor_user_id: context.user.id,
    actor_role: "staff",
    action: "staff_application_deleted",
    entity_type: "application",
    entity_id: application.id,
    description: "Staff member permanently deleted an application in their own recruitment portfolio.",
    metadata: {
      candidate_id: application.candidate_id,
      job_id: application.job_id,
      prior_status: application.status,
      assigned_staff_id: application.assigned_staff_id,
    },
  });

  if (auditError) {
    console.warn("[staff] application deletion audit failed", {
      application_id: application.id,
      code: auditError.code ?? null,
      message: auditError.message,
    });
  }

  const { count: remainingApplicationCount } = await admin
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("candidate_id", application.candidate_id);

  if ((remainingApplicationCount ?? 0) === 0) {
    await admin
      .from("staff_clients")
      .update({
        status: "registered",
        updated_at: new Date().toISOString(),
      })
      .eq("staff_user_id", context.user.id)
      .eq("candidate_user_id", application.candidate_id)
      .eq("status", "applied");
  }

  revalidatePath("/staff");
  revalidatePath("/staff/clients");
  revalidatePath("/staff/applications");
  redirect("/staff/applications?deleted=1");
}
