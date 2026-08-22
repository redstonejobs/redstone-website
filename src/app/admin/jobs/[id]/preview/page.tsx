import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchJobForEdit } from "@/lib/admin/data";
import { dateText, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";
import { benefitStatusLabel, skillLevelLabel } from "@/lib/jobs/catalogue";
import { formatContract, formatMoney, formatProcessingTime, resolveProgrammeFee } from "@/lib/jobs/costs";
import { findCountry, getConfiguredCountries } from "@/lib/public/countries";
import { formatSalary } from "@/lib/public/jobs";
import type { PublicJob } from "@/lib/public/jobs";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminJobPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const { data, error } = await fetchJobForEdit(id);
  if (error || !data) notFound();
  const job = data as Row;
  const countries = await getConfiguredCountries();
  const country = findCountry(countries, textValue(job, ["country"], ""));
  const fee = resolveProgrammeFee(job, country);
  const salary = formatSalary(job as unknown as PublicJob);

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-[#D4AF37] bg-[#FFF8DF] p-4 text-sm font-semibold text-[#071A3D]">
        Secure admin preview. Public visitors can only access published jobs through `/jobs/[slug]`.
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8860B]">{textValue(job, ["status"], "draft")} preview</p>
          <h1 className="mt-2 text-4xl font-black text-[#071A3D]">{textValue(job, ["title"])}</h1>
          <p className="mt-2 text-slate-600">{[job.country, job.city].filter(Boolean).join(" / ")}</p>
        </div>
        <Link href={`/admin/jobs/${id}/edit`} className="w-fit rounded-md bg-[#071A3D] px-4 py-3 text-sm font-semibold text-white">Edit Job</Link>
      </div>
      <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-6 md:grid-cols-2 lg:grid-cols-3">
        <Detail label="Category" value={textValue(job, ["category"])} />
        <Detail label="Skill Level" value={skillLevelLabel(job.skill_level)} />
        <Detail label="Salary" value={salary ?? "To be confirmed by employer"} />
        <Detail label="Contract" value={formatContract(job)} />
        <Detail label="Vacancies" value={textValue(job, ["vacancies"])} />
        <Detail label="Deadline" value={dateText(job.application_deadline)} />
        <Detail label="Processing" value={formatProcessingTime(job, country)} />
        <Detail label={fee.label} value={formatMoney(fee.amount, fee.currency)} />
      </div>
      <section className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-black text-[#071A3D]">Description</h2>
        <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{textValue(job, ["description"], "No description saved.")}</p>
      </section>
      <section className="rounded-md border border-slate-200 bg-white p-6">
        <h2 className="text-2xl font-black text-[#071A3D]">Benefits</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Detail label="Sponsorship" value={benefitStatusLabel(job.sponsorship_status)} />
          <Detail label="Accommodation" value={benefitStatusLabel(job.accommodation_status)} />
          <Detail label="Meals" value={benefitStatusLabel(job.meals_status)} />
          <Detail label="Transport" value={benefitStatusLabel(job.transport_status)} />
          <Detail label="Medical" value={benefitStatusLabel(job.medical_insurance_status)} />
          <Detail label="Air Ticket" value={benefitStatusLabel(job.air_ticket_status)} />
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value || "To be confirmed"}</p></div>;
}
