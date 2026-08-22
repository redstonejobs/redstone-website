import type { Row } from "@/lib/admin/types";
import { textValue } from "@/lib/admin/format";

type EmployerFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  employer?: Row | null;
  submitLabel: string;
};

export function EmployerForm({ action, employer, submitLabel }: EmployerFormProps) {
  return (
    <form action={action} className="grid gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Field name="company_name" label="Company Name" defaultValue={textValue(employer, ["company_name", "name"], "")} required />
        <Field name="registration_number" label="Registration Number" defaultValue={textValue(employer, ["registration_number"], "")} />
        <Field name="website" label="Website" defaultValue={textValue(employer, ["website"], "")} />
        <Field name="email" label="Email" type="email" defaultValue={textValue(employer, ["email"], "")} />
        <Field name="phone" label="Phone" defaultValue={textValue(employer, ["phone"], "")} />
        <Field name="country" label="Country" defaultValue={textValue(employer, ["country"], "")} />
        <Field name="city" label="City" defaultValue={textValue(employer, ["city"], "")} />
        <Field name="owner_user_id" label="Owner User ID" defaultValue={textValue(employer, ["owner_user_id"], "")} />
      </div>

      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Address
        <input
          name="address"
          defaultValue={textValue(employer, ["address"], "")}
          className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
        />
      </label>

      <label className="grid gap-2 text-sm font-semibold text-slate-700">
        Description
        <textarea
          name="description"
          rows={6}
          defaultValue={textValue(employer, ["description"], "")}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Verification Status
          <select
            name="verification_status"
            defaultValue={textValue(employer, ["verification_status"], "pending")}
            className="min-h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-normal"
          >
            <option value="pending">pending</option>
            <option value="verified">verified</option>
            <option value="rejected">rejected</option>
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-700">
          <input name="is_active" type="checkbox" defaultChecked={employer?.is_active !== false} className="h-4 w-4 accent-[#D4AF37]" />
          Active
        </label>
      </div>

      <button type="submit" className="w-fit rounded-md bg-[#071A3D] px-5 py-3 text-sm font-semibold text-white">
        {submitLabel}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  defaultValue,
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="min-h-11 rounded-md border border-slate-300 px-3 text-sm font-normal outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
      />
    </label>
  );
}

