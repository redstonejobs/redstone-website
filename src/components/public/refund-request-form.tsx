"use client";

import { useActionState } from "react";

import { submitRefundRequest, type EnquiryState } from "@/lib/public/actions";

const initialState: EnquiryState = { ok: false, message: "" };

export function RefundRequestForm() {
  const [state, action, pending] = useActionState(submitRefundRequest, initialState);

  return (
    <form action={action} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
      <div className="border-b border-slate-100 pb-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Official request form</p>
        <h2 className="mt-2 text-2xl font-black text-[#071A3D]">Request a refund or cancellation review</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          Submit the payment and application information available to you. A request reference confirms receipt only; it does not mean a refund has been approved.
        </p>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field name="full_name" label="Full Name" required />
        <Field name="email" label="Email Address" type="email" required />
        <Field name="phone" label="Phone Number" type="tel" />
        <Field name="application_reference" label="Application / Case Reference" placeholder="If available" />
        <Field name="destination" label="Country / Destination" placeholder="If relevant" />
        <SelectField name="request_type" label="Request Type" required options={["Refund Request", "Cancellation Request", "Refund and Cancellation Request"]} />
        <SelectField
          name="payment_category"
          label="Payment / Service Category"
          required
          options={[
            "CV & Document Verification Fee",
            "Recruitment / Programme Fee",
            "Medical or Health Screening",
            "Visa / Government Fee",
            "Document / Police / Translation Service",
            "Travel / Air Ticket / Accommodation",
            "Duplicate or Incorrect Payment",
            "Other Payment or Service",
          ]}
        />
        <Field name="payment_reference" label="Receipt / Transaction Reference" placeholder="M-Pesa, bank, receipt or payment reference" />
        <Field name="payment_date" label="Payment Date" type="date" />
        <Field name="amount" label="Amount Paid" type="number" placeholder="Example: 2000" />
        <SelectField name="currency" label="Currency" options={["KES", "USD", "CAD", "AUD", "NZD", "GBP", "EUR", "AED", "QAR", "SAR", "KWD", "BHD", "OMR", "SGD"]} />
        <SelectField name="payment_method" label="Payment Method" options={["M-Pesa", "Bank Transfer / Deposit", "Card", "Cash at Official Office", "Paid Directly to Third-Party Provider", "Other"]} />
      </div>

      <label className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
        Why are you requesting a refund or cancellation? <span className="text-red-600">*</span>
        <textarea
          name="reason"
          rows={8}
          required
          minLength={40}
          maxLength={3000}
          placeholder="Explain what was paid for, what stage the application reached, why you are requesting cancellation or refund, and any relevant dates or communications."
          className="rounded-xl border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
        />
      </label>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">
        <strong>Keep your evidence:</strong> retain receipts, payment confirmations, contracts, emails and messages. Do not submit PINs, passwords, one-time codes, full card numbers or unnecessary identity documents through this form.
      </div>

      {state.message ? (
        <div role="status" className={`mt-6 rounded-2xl border p-5 text-sm font-semibold leading-7 ${state.ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {state.message}
          {state.reference ? <p className="mt-2 font-black text-[#071A3D]">Reference: {state.reference}</p> : null}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button disabled={pending} className="rounded-xl bg-[#071A3D] px-6 py-3.5 text-sm font-black text-white transition hover:bg-[#102D5A] disabled:cursor-not-allowed disabled:opacity-60">
          {pending ? "Submitting Request..." : "Submit Refund / Cancellation Request"}
        </button>
        <p className="max-w-xl text-xs leading-6 text-slate-500">
          Eligibility is determined after the payment record, service stage, written programme terms and any third-party charges are reviewed.
        </p>
      </div>
    </form>
  );
}

function Field({ name, label, type = "text", required = false, placeholder }: { name: string; label: string; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>{label}{required ? <span className="text-red-600"> *</span> : null}</span>
      <input name={name} type={type} required={required} placeholder={placeholder} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} className="min-h-12 rounded-xl border border-slate-300 px-4 font-normal outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20" />
    </label>
  );
}

function SelectField({ name, label, options, required = false }: { name: string; label: string; options: string[]; required?: boolean }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>{label}{required ? <span className="text-red-600"> *</span> : null}</span>
      <select name={name} required={required} defaultValue="" className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20">
        <option value="">{required ? "Select an option" : "Select if applicable"}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  );
}
