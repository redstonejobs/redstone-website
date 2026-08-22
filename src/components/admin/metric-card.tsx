import Link from "next/link";
import type { CountMetric } from "@/lib/admin/types";

const toneClasses: Record<NonNullable<CountMetric["tone"]>, string> = {
  navy: "border-[#071A3D]/15 bg-[#071A3D] text-white",
  gold: "border-[#D4AF37]/30 bg-[#FFF8DF] text-[#071A3D]",
  blue: "border-blue-200 bg-blue-50 text-blue-900",
  green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-900",
  slate: "border-slate-200 bg-white text-slate-900",
};

export function MetricCard({ metric }: { metric: CountMetric }) {
  const card = (
    <div className={`min-h-28 rounded-lg border p-5 shadow-sm ${toneClasses[metric.tone ?? "slate"]}`}>
      <p className="text-sm font-medium opacity-80">{metric.label}</p>
      <p className="mt-3 text-3xl font-bold">{metric.value === null ? "Unavailable" : metric.value}</p>
    </div>
  );

  if (!metric.href) {
    return card;
  }

  return (
    <Link href={metric.href} className="block transition hover:-translate-y-0.5 hover:shadow-md">
      {card}
    </Link>
  );
}

