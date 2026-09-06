"use client";

import { useActionState } from "react";

import { submitPublicComplaint, type EnquiryState } from "@/lib/public/actions";

const initialState: EnquiryState = { ok: false, message: "" };

export function ComplaintForm() {
  const [state, action, pending] = useActionState(submitPublicComplaint, initialState);

  return (
    <form action={action} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Official complaint form</p>
          <h2 className="mt-2 text-2xl font-black text-[#071A3D]">Submit a complaint to Red Stone</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Give enough information for the concern to be identified and reviewed. Do not include passwords, card PINs, one-time codes or unnecessary copies of sensitive identity documents.
          </p>
        </div>
        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#071A3D] text-xl text-[#F2D675] sm:flex" aria-hidden="true">!</div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field name="full_name" label="Full Name" required />
        <Field name="email" label="Email Address" type="email" required />
        <Field name="phone" label="Phone Number" type="tel" />
        <SelectField
          name="relationship"
          label="Your Relationship to Red Stone"
          options={["Candidate / Applicant", "Placed Worker", "Employer", "Family Member", "Member of the Public", "Other"]}
        />
        <SelectField
          name="category"
          label="Complaint Category"
          required
          options={[
            "Recruitment / Application Issue",
            "Staff Conduct or Communication",
            "Payment / Receipt Concern",
            "Fraud / Impersonation / Suspicious Activity",
            "Employer or Job Offer Concern",
            "Medical / Compliance Process",
            "Visa / Documentation Process",
            "Discrimination / Harassment / Unfair Treatment",
            "Privacy / Data / Account Concern",
            "Other Complaint",
          ]}
        />
        <Field name="application_reference" label="Application / Case Reference" placeholder="If available" />
        <Field name="destination" label="Country / Destination" placeholder="If relevant" />
        <Field name="incident_date" label="Incident Date" type="date" />
      </div>

      <div className="mt-5 grid gap-5">
        <Field name="subject" label="Complaint Subject" required maxLength={140} />

        <label className="grid gap-2 text-sm font-bold text-slate-700">
          What happened? <span className="text-red-600">*</span>
          <textarea
            name="details"
            rows={8}
            required
            minLength={40}
            maxLength={3000}
            placeholder="Explain what happened, who was involved, relevant dates, payments or communications, and what you have already done to resolve the issue."
            className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-slate-700">
          What resolution are you requesting?
          <textarea
            name="resolution"
            rows={4}
            maxLength={1000}
            placeholder="For example: explanation, correction, receipt review, staff follow-up, account correction or escalation."
            className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
          />
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">
        <strong>Evidence:</strong> Keep receipts, screenshots, contracts, email headers, payment confirmations and relevant messages. The first web submission does not require document uploads. Red Stone may request specific evidence through an official channel during review.
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
          {state.reference ? (
            <p className="mt-2 font-black text-[#071A3D]">Reference: {state.reference}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          disabled={pending}
          className="rounded-xl bg-[#071A3D] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#102D5A] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Submitting Complaint..." : "Submit Complaint"}
        </button>
        <p className="max-w-xl text-xs leading-6 text-slate-500">
          Submitting a complaint does not affect your right to contact an appropriate regulator, law-enforcement agency, payment provider or other competent authority where applicable.
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
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>{label}{required ? <span className="text-red-600"> *</span> : null}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
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
