import Link from "next/link";

import { getCountryVisual } from "@/lib/public/country-visuals";

export function CountryIdentityHero({
  countryName,
  countrySlug,
  region,
  overview,
  jobSearchUrl,
  visaUrl,
}: {
  countryName: string;
  countrySlug: string;
  region: string;
  overview: string;
  jobSearchUrl: string;
  visaUrl: string;
}) {
  const visual = getCountryVisual(countrySlug);

  return (
    <section className="relative overflow-hidden bg-[#071A3D] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#071A3D] via-[#0D2B59] to-[#102D5A]" />
      <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border border-white/5 bg-white/5 blur-2xl" aria-hidden="true" />
      <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-[#D4AF37]/10 blur-3xl" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:py-28">
        <div className="max-w-5xl">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-4xl shadow-inner"
              aria-label={`${countryName} flag`}
              role="img"
            >
              {visual.flag}
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">{region}</p>
              <p className="mt-1 text-sm font-bold text-slate-300">Country Recruitment Guide 2026</p>
            </div>
          </div>

          <h1 className="mt-6 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {countryName} Jobs, Recruitment & Work Visa Guide
          </h1>
          <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">{overview}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={jobSearchUrl} className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]">
              View {countryName} Jobs
            </Link>
            <Link href="/apply" className="rounded-xl bg-white px-6 py-3.5 text-sm font-black text-[#071A3D] transition hover:bg-slate-100">
              Apply Now
            </Link>
            <Link href={visaUrl} className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/15">
              Full Visa Guide
            </Link>
          </div>
        </div>

        <aside className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F2D675]">Country identity</p>
              <h2 className="mt-2 text-3xl font-black text-white">{countryName}</h2>
            </div>
            <div className="text-6xl" aria-hidden="true">{visual.flag}</div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#071A3D]/45 p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-300">Recognized landmark</p>
            <p className="mt-3 text-2xl font-black text-[#F2D675]">{visual.landmark}</p>
            <p className="mt-2 text-sm font-semibold text-slate-200">{visual.landmarkNote}</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs font-black uppercase tracking-[0.1em]">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-slate-200">Jobs & Careers</div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-4 text-slate-200">Visa Guidance</div>
          </div>
        </aside>
      </div>
    </section>
  );
}
