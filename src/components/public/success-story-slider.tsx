"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { SuccessStory } from "@/lib/public/success-stories";

export function SuccessStorySlider({ stories }: { stories: SuccessStory[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const hasStories = stories.length > 0;

  const activeStory = useMemo(
    () => (hasStories ? stories[activeIndex % stories.length] : null),
    [activeIndex, hasStories, stories]
  );

  useEffect(() => {
    if (!hasStories || stories.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % stories.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [hasStories, paused, stories.length]);

  if (!activeStory) {
    return (
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-72 items-center justify-center p-8 text-center sm:p-10">
          <div className="max-w-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#071A3D] text-2xl font-black text-[#F2D675]">
              ✓
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#B8860B]">
              Verified stories only
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#071A3D]">Client journeys are being prepared for publication.</h2>
            <p className="mt-5 text-sm leading-8 text-slate-600 sm:text-base">
              Red Stone publishes client information only after verification and publication approval.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const previous = () =>
    setActiveIndex((current) => (current - 1 + stories.length) % stories.length);
  const next = () => setActiveIndex((current) => (current + 1) % stories.length);

  const initials = activeStory.clientName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const travelDate = new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${activeStory.travelDate}T12:00:00Z`));

  return (
    <section
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg"
      aria-roledescription="carousel"
      aria-label="Verified client success stories"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
        <div className="flex min-h-80 items-center bg-[#071A3D] p-8 text-white sm:p-10">
          <div className="w-full">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#F2D675]/35 bg-white/10 text-2xl font-black text-[#F2D675]" aria-hidden="true">
              {initials}
            </div>
            <span className="mt-6 inline-flex rounded-full border border-[#F2D675]/30 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#F2D675]">
              Verified Client
            </span>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-slate-300">
              Destination
            </p>
            <p className="mt-1 text-3xl font-black text-white">{activeStory.destination}</p>
            <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-slate-300">
              Journey
            </p>
            <p className="mt-1 text-lg font-bold text-[#F2D675]">{activeStory.journeyStage}</p>
          </div>
        </div>

        <article className="flex min-h-80 items-center p-8 sm:p-10 lg:p-12" aria-live="polite">
          <div className="w-full">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
              Client Success Story
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#071A3D] sm:text-4xl">
              {activeStory.clientName}
            </h2>
            <p className="mt-4 text-xl font-bold text-slate-700">{activeStory.role}</p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Destination</p>
                <p className="mt-2 text-lg font-black text-[#071A3D]">{activeStory.destination}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Travel date</p>
                <p className="mt-2 text-lg font-black text-[#071A3D]">{travelDate}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm font-bold text-emerald-700">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50" aria-hidden="true">✓</span>
              Verified Red Stone client journey with publication permission
            </div>
          </div>
        </article>
      </div>

      <div className="border-t border-slate-100 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-[#071A3D]">
              Story {activeIndex + 1} of {stories.length}
            </p>
            <div className="mt-2 h-1.5 w-40 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
              <div
                className="h-full rounded-full bg-[#D4AF37] transition-all duration-500"
                style={{ width: `${((activeIndex + 1) / stories.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={previous}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-[#071A3D] hover:border-[#D4AF37]"
              aria-label="Previous success story"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={next}
              className="rounded-lg bg-[#071A3D] px-4 py-2 text-sm font-black text-white hover:bg-[#102D5A]"
              aria-label="Next success story"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center sm:px-8">
        <p className="text-xs leading-6 text-slate-500">
          Client photographs are not displayed. Success stories show only authorized recruitment journey details. Individual outcomes do not guarantee the same result for another applicant.
        </p>
      </div>
    </section>
  );
}

export function SuccessStoryActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/jobs"
        className="rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white transition hover:bg-[#102D5A]"
      >
        Browse Jobs
      </Link>
      <Link
        href="/apply"
        className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]"
      >
        Start Application
      </Link>
    </div>
  );
}
