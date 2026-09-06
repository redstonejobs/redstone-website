"use client";

import { useActionState } from "react";

import { submitAccountDeletionRequest, type EnquiryState } from "@/lib/public/actions";

const initialState: EnquiryState = { ok: false, message: "" };

export function AccountDeletionForm() {
  const [state, action, pending] = useActionState(submitAccountDeletionRequest, initialState);

  return (
    <form action={action} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="border-b border-slate-100 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Official account deletion request</p>
        <h2 className="mt-2 text-2xl font-black text-[#071A3D]">Request account closure or personal-data deletion</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Use the email address associated with your Red Stone account. Submission creates a request for verification and review; it does not instantly delete your account.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field name="full_name" label="Full Name" required />
        <Field name="email" label="Account Email Address" type="email" required />
        <Field name="phone" label="Phone Number" type="tel" placeholder="Optional, but useful for matching the account" />
        <SelectField
          name="account_type"
          label="Account Type"
          required
          options={["Candidate / Applicant", "Employer", "Website User", "Other / Not Sure"]}
        />
        <Field name="application_reference" label="Application / Case Reference" placeholder="If available" />
        <SelectField
          name="request_scope"
          label="What do you want to request?"
          required
          options={[
            "Close my account and request deletion of eligible personal data",
            "Delete eligible personal data but keep only records Red Stone must lawfully retain",
            "Close my account only",
            "I am not sure — please contact me before processing",
          ]}
        />
      </div>

      <label className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
        Additional Information or Reason
        <textarea
          name="reason"
          rows={5}
          maxLength={2000}
          placeholder="Optional. Add any information that helps Red Stone identify the account or understand your request. Do not include passwords, PINs or one-time codes."
          className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
        />
      </label>

      <label className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
        <input
          type="checkbox"
          name="acknowledgement"
          value="confirmed"
          required
          className="mt-1 h-4 w-4 rounded border-amber-400"
        />
        <span>
          I understand that account or data deletion may be irreversible after completion, and that Red Stone may first verify my identity and may retain limited records where required by law, fraud prevention, dispute handling, accounting, safeguarding or another legitimate legal obligation.
        </span>
      </label>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-xs leading-6 text-slate-600">
        <strong className="text-[#071A3D]">Security:</strong> Never enter your password, M-Pesa PIN, bank PIN, OTP, card security code or account recovery code in this form. Red Stone may contact you through an official channel to verify that the request came from the account holder.
      </div>

      {state.message ? (
        <div
          role="status"
          className={`mt-6 rounded-2xl border p-5 text-sm font-semibold leading-7 ${
            state.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {state.message}
          {state.reference ? <p className="mt-2 font-black text-[#071A3D]">Reference: {state.reference}</p> : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          disabled={pending}
          className="rounded-xl bg-[#071A3D] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#102D5A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Submitting Request..." : "Submit Account Deletion Request"}
        </button>
        <p className="max-w-xl text-xs leading-6 text-slate-500">
          Keep the reference shown after submission. It confirms receipt of the request, not that deletion has already been completed.
        </p>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>{label}{required ? <span className="text-red-600"> *</span> : null}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="min-h-12 rounded-xl border border-slate-300 px-4 font-normal outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
      />
    </label>
  );
}

function SelectField({
  name,
  label,
  options,
  required = false,
}: {
  name: string;
  label: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>{label}{required ? <span className="text-red-600"> *</span> : null}</span>
      <select
        name={name}
        required={required}
        defaultValue=""
        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
      >
        <option value="" disabled>{required ? "Select an option" : "Select if applicable"}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
