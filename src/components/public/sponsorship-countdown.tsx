"use client";

import { useEffect, useMemo, useState } from "react";

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function remainingUntil(deadline: string): Remaining {
  const difference = new Date(deadline).getTime() - Date.now();
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(difference / 86_400_000);
  const hours = Math.floor((difference % 86_400_000) / 3_600_000);
  const minutes = Math.floor((difference % 3_600_000) / 60_000);
  const seconds = Math.floor((difference % 60_000) / 1_000);

  return { days, hours, minutes, seconds, expired: false };
}

export function SponsorshipCountdown({ deadline }: { deadline: string }) {
  const initial = useMemo(() => remainingUntil(deadline), [deadline]);
  const [remaining, setRemaining] = useState(initial);

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(remainingUntil(deadline)), 1_000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  if (remaining.expired) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-center">
        <p className="text-sm font-black text-amber-900">This intake window has closed.</p>
        <p className="mt-1 text-xs text-amber-800">Check the current published vacancies or contact Red Stone for the next verified intake.</p>
      </div>
    );
  }

  const units = [
    [remaining.days, "Days"],
    [remaining.hours, "Hours"],
    [remaining.minutes, "Minutes"],
    [remaining.seconds, "Seconds"],
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-2 sm:gap-3" aria-label="Sponsorship intake countdown">
      {units.map(([value, label]) => (
        <div key={label} className="rounded-xl border border-white/15 bg-white/10 px-2 py-4 text-center backdrop-blur-sm sm:px-4">
          <div className="text-2xl font-black text-white sm:text-3xl">{String(value).padStart(2, "0")}</div>
          <div className="mt-1 text-[10px] font-black uppercase tracking-wide text-[#F2D675] sm:text-xs">{label}</div>
        </div>
      ))}
    </div>
  );
}
