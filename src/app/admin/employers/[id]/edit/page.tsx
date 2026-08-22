import { notFound } from "next/navigation";
import { EmployerForm } from "@/components/admin/employer-form";
import { updateEmployer } from "@/lib/admin/actions";
import { fetchById } from "@/lib/admin/data";
import { textValue } from "@/lib/admin/format";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEmployerPage({ params }: PageProps) {
  const { id } = await params;
  const { data: employer, error } = await fetchById("employers", id);

  if (error || !employer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Edit {textValue(employer, ["company_name", "name"])}</h1>
        <p className="mt-1 text-sm text-slate-600">Update employer details and verification metadata.</p>
      </div>
      <EmployerForm action={updateEmployer.bind(null, id)} employer={employer} submitLabel="Save Employer" />
    </div>
  );
}
