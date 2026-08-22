import { VacancyRequestForm } from "@/components/employer/vacancy-request-form";
import { createEmployerJobRequest } from "@/lib/employer/actions";

export default function NewEmployerJobRequestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-[#071A3D]">New Vacancy Request</h1>
        <p className="mt-2 text-slate-600">Save a draft or submit the vacancy for Red Stone review after your company is verified.</p>
      </div>
      <VacancyRequestForm action={createEmployerJobRequest} />
    </div>
  );
}
