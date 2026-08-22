import Link from "next/link";
import { fetchCountrySettings } from "@/lib/admin/data";
import { moneyText, textValue } from "@/lib/admin/format";

export default async function AdminCountriesPage() {
  const { rows } = await fetchCountrySettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Country Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Manage active recruitment destinations, programme fee labels and processing estimates.</p>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Programme Fee</th>
              <th className="px-4 py-3">Processing</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((country) => (
              <tr key={String(country.id)}>
                <td className="px-4 py-3 font-semibold text-[#071A3D]">{textValue(country, ["country_name"])}</td>
                <td className="px-4 py-3 text-slate-600">{textValue(country, ["region"])}</td>
                <td className="px-4 py-3 text-slate-600">{moneyText({ salary_min: country.base_recruitment_fee, currency: country.fee_currency })}</td>
                <td className="px-4 py-3 text-slate-600">{processing(country)}</td>
                <td className="px-4 py-3 text-slate-600">{country.is_active === false ? "Inactive" : "Active"}{country.is_featured ? " / Featured" : ""}</td>
                <td className="px-4 py-3"><Link className="font-bold text-[#B8860B]" href={`/admin/countries/${country.id}`}>Manage</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function processing(country: Record<string, unknown>) {
  if (country.processing_time_min && country.processing_time_max && country.processing_time_unit) {
    return `${country.processing_time_min}-${country.processing_time_max} ${country.processing_time_unit}`;
  }
  return "Processing time varies";
}
