import { notFound } from "next/navigation";
import { CountryForm } from "@/components/admin/country-form";
import { updateCountrySetting } from "@/lib/admin/actions";
import { fetchById } from "@/lib/admin/data";
import { textValue } from "@/lib/admin/format";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminCountryEditPage({ params }: PageProps) {
  const { id } = await params;
  const { data: country, error } = await fetchById("country_recruitment_settings", id);
  if (error || !country) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Edit {textValue(country, ["country_name"])}</h1>
        <p className="mt-1 text-sm text-slate-600">Update public fee labels, programme costs and processing estimates.</p>
      </div>
      <CountryForm country={country} action={updateCountrySetting.bind(null, id)} />
    </div>
  );
}
