import { JobForm } from "@/components/admin/job-form";
import { createJob } from "@/lib/admin/actions";

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Create Job</h1>
        <p className="mt-1 text-sm text-slate-600">Add a real recruitment vacancy to the admin system.</p>
      </div>
      <JobForm action={createJob} submitLabel="Create Job" />
    </div>
  );
}

