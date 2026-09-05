import "server-only";

import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { CV_DOCUMENT_VERIFICATION_FEE, paymentsEnabled } from "./config";
import {
  initiateDarajaStkPush,
  queryDarajaStkPushStatus,
} from "./mpesa/daraja";
import { normalizeMpesaPhone } from "./mpesa/phone";

export type PaymentRow = Record<string, unknown>;

const ACTIVE_PAYMENT_STATUSES = ["initiated", "pending"];

export function applicationReference(applicationId: string) {
  return `RS-APP-${applicationId.replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

export function internalPaymentReference() {
  return `RS-TXN-${new Date().getFullYear()}-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

export async function getCandidateApplicationPayments(applicationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("application_payments")
    .select(
      "id, application_id, job_id, provider, purpose, amount, currency, phone_number, internal_reference, merchant_request_id, checkout_request_id, provider_receipt, receipt_number, receipt_issued_at, status, result_code, result_description, initiated_at, paid_at, failed_at, expires_at, created_at, updated_at"
    )
    .eq("application_id", applicationId)
    .eq("purpose", CV_DOCUMENT_VERIFICATION_FEE.purpose)
    .order("created_at", { ascending: false })
    .returns<PaymentRow[]>();

  return { payments: error ? [] : data ?? [], error };
}

export async function getCandidatePaymentByReference(reference: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("application_payments")
    .select(
      "id, application_id, purpose, amount, currency, internal_reference, provider_receipt, receipt_number, receipt_issued_at, status, result_description, paid_at, failed_at, updated_at"
    )
    .eq("internal_reference", reference)
    .maybeSingle<PaymentRow>();

  return { payment: error ? null : data, error };
}

export async function createOrReuseApplicationPayment({
  applicationId,
  candidateId,
  phoneNumber,
}: {
  applicationId: string;
  candidateId: string;
  phoneNumber: string;
}) {
  const phone = normalizeMpesaPhone(phoneNumber);
  const admin = createAdminClient();
  const { application, error } = await loadPayableApplication(
    admin,
    applicationId,
    candidateId
  );

  if (error || !application) {
    throw new Error("This application is not ready for payment.");
  }

  const applicationStatus = String(application.status ?? "");
  if (!["ready_for_payment", "payment_pending"].includes(applicationStatus)) {
    throw new Error("Complete the application review before starting payment.");
  }

  const existing = await findReusablePayment(admin, applicationId);
  if (existing) {
    const existingStatus = String(existing.status ?? "");
    const checkoutRequestId = text(existing.checkout_request_id);

    // A confirmed pending request must never be duplicated. If an older
    // initiated row exists without a CheckoutRequestID (for example after a
    // provider/network failure), safely retry the STK request against the same
    // internal payment record instead of leaving the candidate stuck forever.
    if (existingStatus === "pending" && checkoutRequestId) {
      return {
        payment: existing,
        reused: true,
        stkStarted: false,
        message: "Existing M-Pesa payment request is still pending.",
      };
    }

    if (!paymentsEnabled()) {
      return {
        payment: existing,
        reused: true,
        stkStarted: false,
        message: "Payment service is being configured.",
      };
    }

    const retryPhone = text(existing.phone_number) ?? phone;
    const updated = await startStkForPayment({
      admin,
      payment: existing,
      applicationId,
      candidateId,
      phoneNumber: retryPhone,
    });

    return {
      payment: updated,
      reused: true,
      stkStarted: true,
      message: text(updated.result_description) ?? "M-Pesa payment request sent.",
    };
  }

  const internal_reference = internalPaymentReference();
  const { data: payment, error: insertError } = await admin
    .from("application_payments")
    .insert({
      application_id: applicationId,
      candidate_id: candidateId,
      job_id: application.job_id,
      provider: "mpesa",
      purpose: CV_DOCUMENT_VERIFICATION_FEE.purpose,
      amount: CV_DOCUMENT_VERIFICATION_FEE.amount,
      currency: CV_DOCUMENT_VERIFICATION_FEE.currency,
      phone_number: phone,
      internal_reference,
      status: paymentsEnabled() ? "initiated" : "initiated",
      initiated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
    .select("*")
    .single<PaymentRow>();

  if (insertError || !payment) {
    throw new Error("Payment request could not be prepared.");
  }

  await admin
    .from("applications")
    .update({ status: "payment_pending" })
    .eq("id", applicationId)
    .eq("candidate_id", candidateId)
    .in("status", ["ready_for_payment", "payment_pending"]);

  if (!paymentsEnabled()) {
    return {
      payment,
      reused: false,
      stkStarted: false,
      message: "Payment service is being configured.",
    };
  }

  const updated = await startStkForPayment({
    admin,
    payment,
    applicationId,
    candidateId,
    phoneNumber: phone,
  });

  return {
    payment: updated,
    reused: false,
    stkStarted: true,
    message: text(updated.result_description) ?? "M-Pesa payment request sent.",
  };
}

export async function markApplicationReadyForPayment(
  applicationId: string,
  candidateId: string
) {
  const admin = createAdminClient();
  const { application, error } = await loadPayableApplication(
    admin,
    applicationId,
    candidateId
  );

  if (error || !application) {
    throw new Error("This application is not ready for payment.");
  }

  if (String(application.status) === "submitted") {
    return application;
  }

  const { data: readinessRows } = await admin
    .from("application_section_progress")
    .select("section_key, status")
    .eq("application_id", applicationId)
    .in("section_key", ["personal", "passport", "declarations"]);

  const completed = new Set(
    (readinessRows ?? [])
      .filter((row) => String(row.status ?? "") === "complete")
      .map((row) => String(row.section_key ?? ""))
  );

  if (!["personal", "passport", "declarations"].every((key) => completed.has(key))) {
    throw new Error("Complete the required application sections before payment.");
  }

  const { data, error: updateError } = await admin
    .from("applications")
    .update({ status: "ready_for_payment" })
    .eq("id", applicationId)
    .eq("candidate_id", candidateId)
    .in("status", ["draft", "ready_for_payment", "payment_pending"])
    .select("*")
    .single<PaymentRow>();

  if (updateError || !data) {
    throw new Error("Application could not be marked ready for payment.");
  }

  return data;
}

async function startStkForPayment({
  admin,
  payment,
  applicationId,
  candidateId,
  phoneNumber,
}: {
  admin: ReturnType<typeof createAdminClient>;
  payment: PaymentRow;
  applicationId: string;
  candidateId: string;
  phoneNumber: string;
}) {
  const paymentId = text(payment.id);
  if (!paymentId) throw new Error("Payment request could not be prepared.");

  try {
    const response = await initiateDarajaStkPush({
      amount: CV_DOCUMENT_VERIFICATION_FEE.amount,
      phoneNumber,
      accountReference: applicationReference(applicationId),
      callbackUrl:
        process.env.DARAJA_CALLBACK_URL ??
        "https://redstone.co.ke/api/payments/mpesa/callback",
    });

    const { data: updated, error } = await admin
      .from("application_payments")
      .update({
        phone_number: phoneNumber,
        merchant_request_id: response.merchantRequestId,
        checkout_request_id: response.checkoutRequestId,
        status: "pending",
        result_description: response.customerMessage,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      })
      .eq("id", paymentId)
      .select("*")
      .single<PaymentRow>();

    if (error || !updated) {
      throw new Error("Payment request could not be recorded.");
    }

    return updated;
  } catch (error) {
    console.error("[payments] STK initiation failed", {
      payment_id: paymentId,
      application_id: applicationId,
      message: error instanceof Error ? error.message : "unknown_error",
    });

    await Promise.all([
      admin
        .from("application_payments")
        .update({
          status: "failed",
          result_description: "M-Pesa request could not be started. Please retry.",
          failed_at: new Date().toISOString(),
        })
        .eq("id", paymentId)
        .in("status", ["initiated", "pending"]),
      admin
        .from("applications")
        .update({ status: "ready_for_payment" })
        .eq("id", applicationId)
        .eq("candidate_id", candidateId)
        .eq("status", "payment_pending"),
    ]);

    throw new Error("M-Pesa request could not be started. Please retry.");
  }
}

export async function processMpesaCallbackPayload(payload: unknown) {
  const callback = extractMpesaCallback(payload);
  if (!callback.checkoutRequestId) {
    return { ok: false, status: 400, message: "Unknown payment request." };
  }

  const admin = createAdminClient();
  const payloadHash = await sha256(canonicalJson(payload));

  const { data: payment } = await admin
    .from("application_payments")
    .select("*")
    .eq("checkout_request_id", callback.checkoutRequestId)
    .maybeSingle<PaymentRow>();

  if (!payment) {
    await admin.rpc("record_mpesa_callback", {
      p_checkout_request_id: callback.checkoutRequestId,
      p_merchant_request_id: callback.merchantRequestId,
      p_result_code: callback.resultCode,
      p_result_description: callback.resultDescription,
      p_payload_hash: payloadHash,
      p_provider_receipt: callback.receipt,
      p_verified_amount: null,
      p_verified_phone: null,
      p_provider_confirmed_success: false,
    });

    return { ok: false, status: 404, message: "Unknown payment request." };
  }

  if (String(payment.status) === "paid") {
    await recordCallback({
      admin,
      callback,
      payloadHash,
      providerConfirmedSuccess: false,
    });
    return { ok: true, status: 200, message: "Payment already finalized." };
  }

  if (callback.resultCode === "0") {
    let verification;

    try {
      verification = await queryDarajaStkPushStatus({
        checkoutRequestId: callback.checkoutRequestId,
      });
    } catch {
      await recordCallback({
        admin,
        callback,
        payloadHash,
        providerConfirmedSuccess: false,
      });

      return {
        ok: true,
        status: 202,
        message: "Payment callback recorded pending provider verification.",
      };
    }

    const providerConfirmedSuccess =
      verification.resultCode === "0" &&
      (!verification.checkoutRequestId ||
        verification.checkoutRequestId === callback.checkoutRequestId) &&
      (!verification.merchantRequestId ||
        !callback.merchantRequestId ||
        verification.merchantRequestId === callback.merchantRequestId);

    if (!providerConfirmedSuccess) {
      await recordCallback({
        admin,
        callback,
        payloadHash,
        providerConfirmedSuccess: false,
      });

      return {
        ok: true,
        status: 202,
        message: "Payment callback did not pass provider verification.",
      };
    }

    const recordResult = await recordCallback({
      admin,
      callback,
      payloadHash,
      providerConfirmedSuccess: true,
    });

    if (recordResult.shouldFinalize && recordResult.paymentId) {
      await admin.rpc("submit_application_after_verified_payment", {
        p_payment_id: recordResult.paymentId,
      });
    }

    return { ok: true, status: 200, message: "Payment finalized." };
  }

  await recordCallback({
    admin,
    callback,
    payloadHash,
    providerConfirmedSuccess: false,
  });

  return { ok: true, status: 200, message: "Payment was not completed." };
}

async function recordCallback({
  admin,
  callback,
  payloadHash,
  providerConfirmedSuccess,
}: {
  admin: ReturnType<typeof createAdminClient>;
  callback: ReturnType<typeof extractMpesaCallback>;
  payloadHash: string;
  providerConfirmedSuccess: boolean;
}) {
  const { data, error } = await admin.rpc("record_mpesa_callback", {
    p_checkout_request_id: callback.checkoutRequestId,
    p_merchant_request_id: callback.merchantRequestId,
    p_result_code: callback.resultCode,
    p_result_description: callback.resultDescription,
    p_payload_hash: payloadHash,
    p_provider_receipt: callback.receipt,
    p_verified_amount: callback.amount,
    p_verified_phone: callback.phone,
    p_provider_confirmed_success: providerConfirmedSuccess,
  });

  if (error) {
    throw new Error("Payment callback could not be recorded.");
  }

  const result = (data ?? {}) as Record<string, unknown>;

  return {
    paymentId: text(result.payment_id),
    shouldFinalize: result.should_finalize === true,
    status: text(result.status),
  };
}

async function loadPayableApplication(
  admin: ReturnType<typeof createAdminClient>,
  applicationId: string,
  candidateId: string
) {
  const { data, error } = await admin
    .from("applications")
    .select(
      "id, candidate_id, job_id, status, job:jobs(id, status, application_deadline, vacancies)"
    )
    .eq("id", applicationId)
    .eq("candidate_id", candidateId)
    .maybeSingle<PaymentRow>();

  if (error || !data) return { application: null, error };

  const job = relation(data.job);
  const today = new Date().toISOString().slice(0, 10);
  const deadline = typeof job?.application_deadline === "string"
    ? job.application_deadline
    : null;
  const vacancies = typeof job?.vacancies === "number" ? job.vacancies : null;
  const closed =
    job?.status !== "published" ||
    Boolean(deadline && deadline < today) ||
    Boolean(vacancies !== null && vacancies <= 0);

  if (closed) return { application: null, error: new Error("closed") };

  return { application: data, error: null };
}

async function findReusablePayment(
  admin: ReturnType<typeof createAdminClient>,
  applicationId: string
) {
  const { data } = await admin
    .from("application_payments")
    .select("*")
    .eq("application_id", applicationId)
    .eq("purpose", CV_DOCUMENT_VERIFICATION_FEE.purpose)
    .in("status", ACTIVE_PAYMENT_STATUSES)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<PaymentRow>();

  if (!data) return null;

  const expiresAt = text(data.expires_at);
  if (expiresAt && Date.parse(expiresAt) <= Date.now()) {
    await admin
      .from("application_payments")
      .update({
        status: "expired",
        result_description: "Payment request expired before completion.",
        failed_at: new Date().toISOString(),
      })
      .eq("id", String(data.id))
      .in("status", ACTIVE_PAYMENT_STATUSES);

    return null;
  }

  return data;
}

function extractMpesaCallback(payload: unknown) {
  const root = payload as Record<string, unknown>;
  const body = root.Body as Record<string, unknown> | undefined;
  const stkCallback = body?.stkCallback as Record<string, unknown> | undefined;
  const metadata = stkCallback?.CallbackMetadata as
    | Record<string, unknown>
    | undefined;
  const items = Array.isArray(metadata?.Item)
    ? (metadata.Item as Record<string, unknown>[])
    : [];
  const item = (name: string) =>
    items.find((entry) => entry.Name === name)?.Value;

  return {
    merchantRequestId: text(stkCallback?.MerchantRequestID),
    checkoutRequestId: text(stkCallback?.CheckoutRequestID),
    resultCode:
      typeof stkCallback?.ResultCode === "number"
        ? String(stkCallback.ResultCode)
        : text(stkCallback?.ResultCode),
    resultDescription: text(stkCallback?.ResultDesc),
    receipt: text(item("MpesaReceiptNumber")),
    amount: amount(item("Amount")),
    phone: phoneNumber(item("PhoneNumber")),
  };
}

function relation(value: unknown) {
  if (Array.isArray(value)) return value[0] as PaymentRow | undefined;
  return value as PaymentRow | undefined;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function sha256(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function amount(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) ? parsed : null;
}

function phoneNumber(value: unknown) {
  const raw =
    typeof value === "number"
      ? String(value)
      : typeof value === "string"
        ? value
        : "";

  if (!raw) return null;

  try {
    return normalizeMpesaPhone(raw);
  } catch {
    return null;
  }
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => canonicalJson(entry)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => {
        const objectValue = value as Record<string, unknown>;
        return `${JSON.stringify(key)}:${canonicalJson(objectValue[key])}`;
      })
      .join(",")}}`;
  }

  return JSON.stringify(value);
}
