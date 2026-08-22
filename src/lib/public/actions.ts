"use server";

import { createClient } from "@/utils/supabase/server";

export type EnquiryState = { ok: boolean; message: string };

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

