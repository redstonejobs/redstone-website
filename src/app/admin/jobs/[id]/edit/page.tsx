import { notFound } from "next/navigation";
import { JobForm } from "@/components/admin/job-form";
import { updateJob } from "@/lib/admin/actions";
import { fetchById } from "@/lib/admin/data";
import { textValue } from "@/lib/admin/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditJobPage({ params }: PageProps) {
  const { id } = await params;
  const { data: job, error } = await fetchById("jobs", id);

  if (error || !job) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Edit {textValue(job, ["title"])}</h1>
        <p className="mt-1 text-sm text-slate-600">Update vacancy details through the authenticated server action.</p>
      </div>
      <JobForm action={updateJob.bind(null, id)} job={job} submitLabel="Save Job" />
    </div>
  );
}

