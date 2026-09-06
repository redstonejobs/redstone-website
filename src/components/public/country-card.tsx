import Link from "next/link";
import type { Country } from "@/lib/public/countries";
import { DEFAULT_PROCESSING_TEXT, formatMoney } from "@/lib/jobs/costs";

export function CountryCard({ country }: { country: Country }) {
  return (
    <Link href={`/countries/${country.slug}`} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-xs font-black uppercase tracking-wide text-[#B8860B]">{country.region}</p>
      <h3 className="mt-2 text-xl font-black text-[#071A3D]">{country.name}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{country.shortDescription}</p>
      <dl className="mt-4 grid gap-2 text-sm text-slate-700">
        {typeof country.publishedJobCount === "number" ? (
          <div><dt className="font-bold">Published Jobs</dt><dd>{country.publishedJobCount}</dd></div>
        ) : null}
        <div><dt className="font-bold">{country.feeLabel}</dt><dd>{formatMoney(country.baseRecruitmentFee, country.feeCurrency)}</dd></div>
        <div><dt className="font-bold">Estimated Processing Time</dt><dd>{processing(country)}</dd></div>
      </dl>
      <span className="mt-5 inline-block font-black text-[#071A3D]">View Opportunities</span>
    </Link>
  );
}

function processing(country: Country) {
  if (country.processingTimeMin && country.processingTimeMax && country.processingTimeUnit) {
    return `${country.processingTimeMin}-${country.processingTimeMax} ${country.processingTimeUnit}`;
  }
  if (country.processingTimeNote) return country.processingTimeNote;
  return DEFAULT_PROCESSING_TEXT;
}
