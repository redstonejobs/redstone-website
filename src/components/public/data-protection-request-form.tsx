"use client";

import { useActionState } from "react";

import { submitDataProtectionRequest, type EnquiryState } from "@/lib/public/actions";

const initialState: EnquiryState = { ok: false, message: "" };

export function DataProtectionRequestForm() {
  const [state, action, pending] = useActionState(submitDataProtectionRequest, initialState);

  return (
    <form action={action} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="border-b border-slate-100 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Official privacy-rights request</p>
        <h2 className="mt-2 text-2xl font-black text-[#071A3D]">Submit a data protection request</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Use this form to ask about access, correction, objection, restriction, portability, erasure or another privacy matter. Red Stone may need to verify your identity before acting on a request that could expose or alter personal information.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field name="full_name" label="Full Name" required />
        <Field name="email" label="Email Address" type="email" required />
        <Field name="phone" label="Phone Number" type="tel" placeholder="Optional" />
        <SelectField
          name="relationship"
          label="Relationship to Red Stone"
          required
          options={["Candidate / Applicant", "Placed Worker", "Employer", "Website User", "Former User", "Authorized Representative", "Other"]}
        />
        <Field name="application_reference" label="Application / Case Reference" placeholder="If available" />
        <SelectField
          name="request_type"
          label="Request Type"
          required
          options={[
            "Access my personal data",
            "Correct inaccurate or misleading personal data",
            "Object to processing of my personal data",
            "Restrict or limit processing where applicable",
            "Request data portability where applicable",
            "Request deletion / erasure of eligible personal data",
            "Ask how my personal data is being used",
            "Withdraw or review a consent-based processing activity",
            "Report a privacy or data-handling concern",
            "Other data protection request",
          ]}
        />
        <SelectField
          name="preferred_response"
          label="Preferred Response Channel"
          options={["Email", "Phone call", "Official WhatsApp / messaging channel", "No preference"]}
        />
      </div>

      <label className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
        Request Details <span className="text-red-600">*</span>
        <textarea
          name="details"
          rows={7}
          required
          minLength={30}
          maxLength={3000}
          placeholder="Describe the personal data, account, application, document, communication or processing activity involved. Do not include passwords, PINs, OTPs or unnecessary identity-document numbers."
          className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
        />
      </label>

      <label className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-7 text-slate-700">
        <input
          type="checkbox"
          name="acknowledgement"
          value="confirmed"
          required
          className="mt-1 h-4 w-4 rounded border-slate-400"
        />
        <span>
          I confirm that the information in this request is accurate to the best of my knowledge. I understand that Red Stone may verify my identity or authority before disclosing, correcting, exporting, restricting or deleting personal data.
        </span>
      </label>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs leading-6 text-amber-950">
        <strong>Security:</strong> Do not submit your password, M-Pesa PIN, bank PIN, one-time password, card security code or account recovery code. Only provide additional identity documents if Red Stone specifically requests them through a verified official channel and explains why they are needed.
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
          {pending ? "Submitting Request..." : "Submit Data Protection Request"}
        </button>
        <p className="max-w-xl text-xs leading-6 text-slate-500">
          Keep the RSEA-DPR reference shown after submission. It confirms receipt of the request, not that the requested action has already been completed.
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
