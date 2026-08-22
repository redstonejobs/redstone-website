"use client";

import { useActionState } from "react";
import { submitPublicEnquiry, type EnquiryState } from "@/lib/public/actions";

const initialState: EnquiryState = { ok: false, message: "" };

export function ContactForm({ type = "general" }: { type?: string }) {
  const [state, action, pending] = useActionState(submitPublicEnquiry, initialState);

  return (
    <form action={action} className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="full_name" label="Full Name" required />
        <Field name="email" label="Email" type="email" required />
        <Field name="phone" label="Phone" />
        <Field name="subject" label="Subject" required />
      </div>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Enquiry Type
        <select name="enquiry_type" defaultValue={type} className="min-h-11 rounded-md border border-slate-300 bg-white px-3 font-normal">
          <option value="general">General</option>
          <option value="jobs">Jobs</option>
          <option value="employer">Employer</option>
          <option value="support">Support</option>
          <option value="complaint">Complaint</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold text-slate-700">
        Message
        <textarea name="message" rows={6} required minLength={20} maxLength={3000} className="rounded-md border border-slate-300 px-3 py-2 font-normal" />
      </label>
      {state.message ? <p className={`text-sm font-semibold ${state.ok ? "text-emerald-700" : "text-red-700"}`}>{state.message}</p> : null}
      <button disabled={pending} className="w-fit rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white disabled:opacity-60">
        {pending ? "Submitting..." : "Submit Enquiry"}
      </button>
    </form>
  );
}

function Field({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}
      <input name={name} type={type} required={required} className="min-h-11 rounded-md border border-slate-300 px-3 font-normal" />
    </label>
  );
}
