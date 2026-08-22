import Link from "next/link";
import type { Country } from "@/lib/public/countries";

export function CountryCard({ country }: { country: Country }) {
  return (
    <Link href={`/countries/${country.slug}`} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-black uppercase tracking-wide text-[#B8860B]">{country.region}</p>
      <h3 className="mt-2 text-xl font-black text-[#071A3D]">{country.name}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{country.shortDescription}</p>
    </Link>
  );
}

