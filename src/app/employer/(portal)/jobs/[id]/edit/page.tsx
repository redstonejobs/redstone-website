import { notFound } from "next/navigation";
import { VacancyRequestForm } from "@/components/employer/vacancy-request-form";
import { updateEmployerJobRequest } from "@/lib/employer/actions";
import { requireEmployer } from "@/lib/employer/auth";
import { getEmployerJobRequest } from "@/lib/employer/data";
import { textValue } from "@/lib/admin/format";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditEmployerJobRequestPage({ params }: PageProps) {
  const { id } = await params;
  const context = await requireEmployer();
  const { data: request } = await getEmployerJobRequest(context, id);
  if (!request || !["employer_draft", "changes_requested"].includes(String(request.status))) notFound();

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black text-[#071A3D]">Edit {textValue(request, ["title"])}</h1><p className="mt-2 text-slate-600">Submitted requests are locked while Red Stone reviews them.</p></div>
      <VacancyRequestForm request={request} action={updateEmployerJobRequest.bind(null, id)} />
    </div>
  );
}
