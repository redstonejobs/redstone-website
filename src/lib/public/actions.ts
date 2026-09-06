"use server";

import { createClient } from "@/utils/supabase/server";

export type EnquiryState = { ok: boolean; message: string; reference?: string };

export async function submitPublicEnquiry(_state: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const payload = {
    full_name: value(formData, "full_name"),
    email: value(formData, "email"),
    phone: value(formData, "phone") || null,
    enquiry_type: value(formData, "enquiry_type") || "general",
    subject: value(formData, "subject"),
    message: value(formData, "message"),
  };

  const errors = validateEnquiry(payload);
  if (errors.length) return { ok: false, message: errors.join(" ") };

  const supabase = await createClient();
  const { error } = await supabase.from("public_enquiries").insert(payload);

  if (error) {
    console.warn("[public]", "enquiry insert failed", { enquiry_type: payload.enquiry_type, error: error.message });
    return { ok: false, message: "We could not submit your enquiry right now. Please use the official email contacts." };
  }

  return { ok: true, message: "Thank you. Your enquiry has been received by Red Stone." };
}

export async function submitPublicComplaint(_state: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const complaint = {
    fullName: value(formData, "full_name"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    relationship: value(formData, "relationship"),
    category: value(formData, "category"),
    applicationReference: value(formData, "application_reference"),
    destination: value(formData, "destination"),
    incidentDate: value(formData, "incident_date"),
    subject: value(formData, "subject"),
    details: value(formData, "details"),
    resolution: value(formData, "resolution"),
  };

  const errors = validateComplaint(complaint);
  if (errors.length) return { ok: false, message: errors.join(" ") };

  const reference = complaintReference();
  const structuredMessage = [
    `Complaint reference: ${reference}`,
    `Relationship to Red Stone: ${complaint.relationship || "Not specified"}`,
    `Complaint category: ${complaint.category}`,
    `Application / case reference: ${complaint.applicationReference || "Not provided"}`,
    `Destination / country: ${complaint.destination || "Not specified"}`,
    `Incident date: ${complaint.incidentDate || "Not specified"}`,
    "",
    "Complaint details:",
    complaint.details,
    "",
    "Preferred resolution:",
    complaint.resolution || "No specific resolution requested",
  ].join("\n");

  const payload = {
    full_name: complaint.fullName,
    email: complaint.email,
    phone: complaint.phone || null,
    enquiry_type: "complaint",
    subject: `[${reference}] ${complaint.subject}`,
    message: structuredMessage,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("public_enquiries").insert(payload);

  if (error) {
    console.warn("[public]", "complaint insert failed", { reference, error: error.message });
    return {
      ok: false,
      message: "We could not submit your complaint right now. Please email support@redstone.co.ke through an official channel.",
    };
  }

  return {
    ok: true,
    reference,
    message: `Your complaint has been received. Please keep reference ${reference} for follow-up.`,
  };
}

export async function submitRefundRequest(_state: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const request = {
    fullName: value(formData, "full_name"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    applicationReference: value(formData, "application_reference"),
    destination: value(formData, "destination"),
    requestType: value(formData, "request_type"),
    paymentCategory: value(formData, "payment_category"),
    paymentReference: value(formData, "payment_reference"),
    paymentDate: value(formData, "payment_date"),
    amount: value(formData, "amount"),
    currency: value(formData, "currency") || "KES",
    paymentMethod: value(formData, "payment_method"),
    reason: value(formData, "reason"),
  };

  const errors = validateRefundRequest(request);
  if (errors.length) return { ok: false, message: errors.join(" ") };

  const reference = refundReference();
  const structuredMessage = [
    `Refund / cancellation reference: ${reference}`,
    `Request type: ${request.requestType}`,
    `Payment category: ${request.paymentCategory}`,
    `Application / case reference: ${request.applicationReference || "Not provided"}`,
    `Destination / country: ${request.destination || "Not specified"}`,
    `Payment reference: ${request.paymentReference || "Not provided"}`,
    `Payment date: ${request.paymentDate || "Not specified"}`,
    `Amount claimed: ${request.amount ? `${request.currency} ${request.amount}` : "Not specified"}`,
    `Payment method: ${request.paymentMethod || "Not specified"}`,
    "",
    "Reason for request:",
    request.reason,
  ].join("\n");

  const payload = {
    full_name: request.fullName,
    email: request.email,
    phone: request.phone || null,
    enquiry_type: "refund_cancellation",
    subject: `[${reference}] ${request.requestType}: ${request.paymentCategory}`,
    message: structuredMessage,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("public_enquiries").insert(payload);

  if (error) {
    console.warn("[public]", "refund request insert failed", { reference, error: error.message });
    return {
      ok: false,
      message: "We could not submit your refund or cancellation request right now. Please email support@redstone.co.ke through an official Red Stone channel.",
    };
  }

  return {
    ok: true,
    reference,
    message: `Your request has been received for review. Please keep reference ${reference}. Submission does not by itself confirm refund eligibility or approval.`,
  };
}

export async function submitAccountDeletionRequest(_state: EnquiryState, formData: FormData): Promise<EnquiryState> {
  const request = {
    fullName: value(formData, "full_name"),
    email: value(formData, "email"),
    phone: value(formData, "phone"),
    accountType: value(formData, "account_type"),
    applicationReference: value(formData, "application_reference"),
    requestScope: value(formData, "request_scope"),
    reason: value(formData, "reason"),
    acknowledgement: value(formData, "acknowledgement"),
  };

  const errors = validateAccountDeletionRequest(request);
  if (errors.length) return { ok: false, message: errors.join(" ") };

  const reference = deletionReference();
  const structuredMessage = [
    `Account deletion reference: ${reference}`,
    `Account type: ${request.accountType}`,
    `Request scope: ${request.requestScope}`,
    `Email associated with account: ${request.email}`,
    `Phone: ${request.phone || "Not provided"}`,
    `Application / case reference: ${request.applicationReference || "Not provided"}`,
    `Acknowledgement: ${request.acknowledgement}`,
    "",
    "Additional information / reason:",
    request.reason || "No additional information provided",
  ].join("\n");

  const payload = {
    full_name: request.fullName,
    email: request.email,
    phone: request.phone || null,
    enquiry_type: "account_deletion",
    subject: `[${reference}] Account deletion request`,
    message: structuredMessage,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("public_enquiries").insert(payload);

  if (error) {
    console.warn("[public]", "account deletion request insert failed", { reference, error: error.message });
    return {
      ok: false,
      message: "We could not submit your account deletion request right now. Please email support@redstone.co.ke from the email address associated with your account.",
    };
  }

  return {
    ok: true,
    reference,
    message: `Your account deletion request has been received. Keep reference ${reference}. Red Stone must verify the request before account or personal-data deletion is carried out.`,
  };
}

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

function validateEnquiry(payload: Record<string, string | null>) {
  const errors: string[] = [];
  if (!payload.full_name || payload.full_name.length < 2) errors.push("Full name is required.");
  if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) errors.push("A valid email is required.");
  if (!payload.subject || payload.subject.length < 3) errors.push("Subject is required.");
  if (!payload.message || payload.message.length < 20) errors.push("Message must be at least 20 characters.");
  if (payload.message && payload.message.length > 3000) errors.push("Message must be 3000 characters or fewer.");
  return errors;
}

function validateComplaint(complaint: Record<string, string>) {
  const errors: string[] = [];
  if (!complaint.fullName || complaint.fullName.length < 2) errors.push("Full name is required.");
  if (!complaint.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(complaint.email)) errors.push("A valid email is required.");
  if (!complaint.category) errors.push("Choose a complaint category.");
  if (!complaint.subject || complaint.subject.length < 5) errors.push("Complaint subject is required.");
  if (!complaint.details || complaint.details.length < 40) errors.push("Please describe the complaint in at least 40 characters.");
  if (complaint.details.length > 3000) errors.push("Complaint details must be 3000 characters or fewer.");
  if (complaint.resolution.length > 1000) errors.push("Preferred resolution must be 1000 characters or fewer.");
  return errors;
}

function validateRefundRequest(request: Record<string, string>) {
  const errors: string[] = [];
  if (!request.fullName || request.fullName.length < 2) errors.push("Full name is required.");
  if (!request.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) errors.push("A valid email is required.");
  if (!request.requestType) errors.push("Choose whether you are requesting a refund, cancellation, or both.");
  if (!request.paymentCategory) errors.push("Choose the payment or service category.");
  if (!request.reason || request.reason.length < 40) errors.push("Please explain the request in at least 40 characters.");
  if (request.reason.length > 3000) errors.push("Request details must be 3000 characters or fewer.");
  if (request.amount && !/^\d+(?:\.\d{1,2})?$/.test(request.amount)) errors.push("Amount must be a valid number.");
  return errors;
}

function validateAccountDeletionRequest(request: Record<string, string>) {
  const errors: string[] = [];
  if (!request.fullName || request.fullName.length < 2) errors.push("Full name is required.");
  if (!request.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email)) errors.push("Use the valid email address associated with your account.");
  if (!request.accountType) errors.push("Choose the account type.");
  if (!request.requestScope) errors.push("Choose what you want Red Stone to delete or close.");
  if (request.reason.length > 2000) errors.push("Additional information must be 2000 characters or fewer.");
  if (request.acknowledgement !== "confirmed") errors.push("Confirm that you understand the deletion request may be irreversible after completion.");
  return errors;
}

function complaintReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `RSEA-CMP-${date}-${random}`;
}

function refundReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `RSEA-RFD-${date}-${random}`;
}

function deletionReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `RSEA-DEL-${date}-${random}`;
}
