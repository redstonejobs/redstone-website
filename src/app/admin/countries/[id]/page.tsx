import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchById } from "@/lib/admin/data";
import { textValue } from "@/lib/admin/format";
import { formatMoney } from "@/lib/jobs/costs";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminCountryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { data: country, error } = await fetchById("country_recruitment_settings", id);
  if (error || !country) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#071A3D]">{textValue(country, ["country_name"])}</h1>
          <p className="mt-1 text-sm text-slate-600">{textValue(country, ["region"])} / {textValue(country, ["country_code"])}</p>
        </div>
        <Link href={`/admin/countries/${id}/edit`} className="w-fit rounded-md bg-[#071A3D] px-4 py-3 text-sm font-semibold text-white">Edit</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Detail label="Fee Label" value={textValue(country, ["fee_label"])} />
        <Detail label="Default Programme Fee" value={formatMoney(numberOrNull(country.base_recruitment_fee), textValue(country, ["fee_currency"], "KES"))} />
        <Detail label="Processing Estimate" value={processing(country)} />
        <Detail label="Active" value={country.is_active === false ? "No" : "Yes"} />
        <Detail label="Featured" value={country.is_featured === true ? "Yes" : "No"} />
        <Detail label="Display Order" value={textValue(country, ["display_order"])} />
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-[#071A3D]">Processing Note</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{textValue(country, ["processing_time_note"], "Processing time varies by employer and immigration process.")}</p>
      </section>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-semibold uppercase text-slate-500">{label}</p><p className="mt-2 text-sm font-semibold text-[#071A3D]">{value}</p></div>;
}

function processing(country: Record<string, unknown>) {
  if (country.processing_time_min && country.processing_time_max && country.processing_time_unit) {
    return `${country.processing_time_min}-${country.processing_time_max} ${country.processing_time_unit}`;
  }
  return "Processing time varies";
}

function numberOrNull(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) return Number(value);
  return null;
}
