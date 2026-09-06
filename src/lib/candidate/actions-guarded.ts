"use server";

export * from "./actions";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireCandidate } from "./auth";
import {
  createOrReuseApplicationPayment,
  markApplicationReadyForPayment,
} from "@/lib/payments/application-payments";
import { normalizeMpesaPhone } from "@/lib/payments/mpesa/phone";

function reviewRedirect(
  applicationId: string,
  message = "Complete the application review before starting payment.",
): never {
  redirect(
    `/candidate/applications/${applicationId}?section=review&error=${encodeURIComponent(message)}`,
  );
}

function readinessMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const normalized = message.toLowerCase();

  if (normalized.includes("complete personal, passport, declarations and documents")) {
    return "Complete Personal, Passport, Declarations and Documents before payment.";
  }

  if (
    normalized.includes("complete the application review") ||
    normalized.includes("not ready for payment")
  ) {
    return "Complete the application review before starting payment.";
  }

  if (normalized.includes("already been submitted")) {
    return "This application has already been submitted.";
  }

  return "Complete the required application sections and final review before starting payment.";
}

async function requirePaymentStage(applicationId: string, candidateId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("status")
    .eq("id", applicationId)
    .eq("candidate_id", candidateId)
    .maybeSingle<{ status: string | null }>();

  if (error || !data) {
    reviewRedirect(applicationId, "Application not found or payment access could not be verified.");
  }

  const status = String(data.status ?? "");
  if (!["ready_for_payment", "payment_pending"].includes(status)) {
    reviewRedirect(applicationId);
  }
}

export async function prepareApplicationPayment(applicationId: string) {
  const context = await requireCandidate();

  try {
    await markApplicationReadyForPayment(applicationId, context.user.id);
  } catch (error) {
    const message = readinessMessage(error);
    console.warn("[candidate] payment readiness check failed", {
      application_id: applicationId,
      message: error instanceof Error ? error.message : "unknown_error",
    });
    reviewRedirect(applicationId, message);
  }

  redirect(`/candidate/applications/${applicationId}?section=payment&ready=1`);
}

export async function initiateApplicationPayment(
  applicationId: string,
  formData: FormData,
) {
  const context = await requireCandidate();

  // Do not let a candidate reach M-Pesa until the application has passed the
  // server-side review/readiness transition. This prevents a draft application
  // from being reported as an STK/Daraja failure.
  await requirePaymentStage(applicationId, context.user.id);

  const phone = String(formData.get("mpesa_phone") ?? "");

  if (formData.get("fee_acknowledgement") !== "yes") {
    redirect(
      `/candidate/applications/${applicationId}?section=payment&payment_error=acknowledgement_required`,
    );
  }

  try {
    normalizeMpesaPhone(phone);
  } catch {
    redirect(
      `/candidate/applications/${applicationId}?section=payment&payment_error=invalid_phone`,
    );
  }

  let result;

  try {
    result = await createOrReuseApplicationPayment({
      applicationId,
      candidateId: context.user.id,
      phoneNumber: phone,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    const normalized = message.toLowerCase();

    console.error("[candidate] payment initiation failed", {
      application_id: applicationId,
      message,
    });

    if (
      normalized.includes("complete the application review") ||
      normalized.includes("not ready for payment")
    ) {
      reviewRedirect(applicationId);
    }

    redirect(
      `/candidate/applications/${applicationId}?section=payment&payment_error=stk_unavailable`,
    );
  }

  const reference = String(result.payment.internal_reference ?? "");
  const params = new URLSearchParams({
    section: "payment",
    payment: result.stkStarted ? "pending" : "configuring",
  });

  if (reference) params.set("reference", reference);

  redirect(`/candidate/applications/${applicationId}?${params.toString()}`);
}
