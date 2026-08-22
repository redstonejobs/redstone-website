import { EmployerForm } from "@/components/admin/employer-form";
import { createEmployer } from "@/lib/admin/actions";

export default function NewEmployerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Add Employer</h1>
        <p className="mt-1 text-sm text-slate-600">Create an employer record without automatically verifying it.</p>
      </div>
      <EmployerForm action={createEmployer} submitLabel="Create Employer" />
    </div>
  );
}

