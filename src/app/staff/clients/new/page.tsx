import Link from "next/link";

import { requireStaff } from "@/lib/admin/auth";
import { registerOwnStaffClient } from "./actions";

export const dynamic = "force-dynamic";

const CLIENT_STATUSES = [
  "lead",
  "contacted",
  "registered",
  "applied",
  "processing",
  "placed",
  "closed",
] as const;

const SOURCE_OPTIONS = [
  { value: "manual", label: "Manual Entry" },
  { value: "referral_link", label: "Referral Link" },
  { value: "walk_in", label: "Walk-In" },
  { value: "phone", label: "Phone Call" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
];

const PASSPORT_OPTIONS = [
  { value: "unknown", label: "Unknown" },
  { value: "none", label: "No Passport" },
  { value: "valid", label: "Valid Passport" },
  { value: "expired", label: "Expired Passport" },
  { value: "processing", label: "Passport Processing" },
];

const MEDICAL_OPTIONS = [
  { value: "unknown", label: "Unknown" },
  { value: "not_started", label: "Not Started" },
  { value: "pending", label: "Medical Pending" },
  { value: "booked", label: "Medical Booked" },
  { value: "completed", label: "Medical Completed" },
  { value: "failed", label: "Medical Failed" },
  { value: "waived", label: "Medical Waived" },
  { value: "expired", label: "Medical Expired" },
];

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function NewStaffClientPage({ searchParams }: PageProps) {
  const context = await requireStaff();
  const params = (await searchParams) ?? {};
  const fullName = context.profile.full_name?.trim() || "Staff Member";
  const errorMessage = registrationError(params.error);

  return (
    <main className="min-h-screen bg-[#EEF1F5] px-5 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B8860B]">
              Staff Client Intake
            </p>
            <h1 className="mt-1 text-3xl font-black text-[#071A3D]">
              Register New Client
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Signed in as <strong>{fullName}</strong>. This record will be assigned only to your staff portfolio.
            </p>
          </div>
          <Link
            href="/staff/clients"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-[#071A3D]"
          >
            Back to My Clients
          </Link>
        </div>

        {errorMessage ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {errorMessage}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[#071A3D] px-6 py-5 text-white">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Recruitment CRM
            </p>
            <h2 className="mt-1 text-xl font-black">Client Details</h2>
          </div>

          <form action={registerOwnStaffClient} className="space-y-5 p-6 sm:p-8">
            <Field label="Full Name" name="full_name" required placeholder="Client full legal name" />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone Number" name="phone" placeholder="+254..." />
              <Field label="Email Address" name="email" type="email" placeholder="client@example.com" />
            </div>
            <p className="-mt-2 text-[11px] leading-5 text-slate-500">
              At least one phone number or email address is required.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nationality" name="nationality" placeholder="e.g. Kenyan" />
              <Field label="Current Country" name="country" placeholder="e.g. Kenya" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Job of Interest" name="interested_job" placeholder="e.g. Warehouse Worker" />
              <Field label="Country of Interest" name="preferred_country" placeholder="e.g. Canada" />
            </div>

            <Field label="Follow-Up Date" name="follow_up_date" type="date" />

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Passport Status" name="passport_status" options={PASSPORT_OPTIONS} />
              <SelectField label="Medical Status" name="medical_status" options={MEDICAL_OPTIONS} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Client Source" name="source" options={SOURCE_OPTIONS} />
              <SelectField
                label="Initial Status"
                name="status"
                options={CLIENT_STATUSES.map((status) => ({
                  value: status,
                  label: statusLabel(status),
                }))}
              />
            </div>

            <label className="block">
              <span className="text-[11px] font-black uppercase tracking-wide text-slate-600">
                Recruitment Notes
              </span>
              <textarea
                name="notes"
                rows={5}
                placeholder="Initial conversation, documents available, follow-up notes..."
                className="mt-2 w-full resize-y rounded-lg border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />
            </label>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
              <Link
                href="/staff"
                className="rounded-lg border border-slate-300 px-5 py-3 text-center text-sm font-black text-slate-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-black text-[#071A3D] shadow-sm transition hover:bg-[#F2D675]"
              >
                Register Client
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-wide text-slate-600">
        {label}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-slate-300 px-3.5 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-wide text-slate-600">
        {label}
      </span>
      <select
        name={name}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function statusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function registrationError(error?: string) {
  if (error === "name_required") return "Enter the client's full name.";
  if (error === "contact_required") return "Enter at least a phone number or email address.";
  if (error === "invalid_source") return "Choose a valid client source.";
  if (error === "create_failed") return "The client could not be registered right now. Please try again.";
  return null;
}
