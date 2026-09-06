import Link from "next/link";
import type { Country } from "@/lib/public/countries";
import { DEFAULT_PROCESSING_TEXT, formatMoney } from "@/lib/jobs/costs";
import { getCountryVisual } from "@/lib/public/country-visuals";

export function CountryCard({ country }: { country: Country }) {
  const visual = getCountryVisual(country.slug);

  return (
    <Link
      href={`/countries/${country.slug}`}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-lg"
    >
      <div className="relative bg-gradient-to-br from-[#071A3D] via-[#0D2B59] to-[#102D5A] px-5 py-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F2D675]">{country.region}</p>
            <h3 className="mt-2 text-2xl font-black text-white">{country.name}</h3>
          </div>
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-4xl shadow-inner"
            aria-label={`${country.name} flag`}
            role="img"
          >
            {visual.flag}
          </div>
        </div>
        <div className="mt-5 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-300">Landmark</p>
          <p className="mt-1 text-sm font-black text-white">{visual.landmark}</p>
          <p className="mt-0.5 text-xs text-slate-300">{visual.landmarkNote}</p>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm leading-6 text-slate-600">{country.shortDescription}</p>
        <dl className="mt-5 grid gap-3 text-sm text-slate-700">
          {typeof country.publishedJobCount === "number" ? (
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <dt className="font-bold">Published Jobs</dt>
              <dd className="font-black text-[#071A3D]">{country.publishedJobCount}</dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
            <dt className="font-bold">{country.feeLabel}</dt>
            <dd className="text-right font-black text-[#071A3D]">{formatMoney(country.baseRecruitmentFee, country.feeCurrency)}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="font-bold">Estimated Processing Time</dt>
            <dd className="text-right font-black text-[#071A3D]">{processing(country)}</dd>
          </div>
        </dl>
        <span className="mt-6 inline-flex items-center gap-2 font-black text-[#B8860B] group-hover:underline">
          View {country.name} Guide <span aria-hidden="true">→</span>
        </span>
      </div>
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
