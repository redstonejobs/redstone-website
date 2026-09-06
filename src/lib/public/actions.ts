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

function complaintReference() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `RSEA-CMP-${date}-${random}`;
}
