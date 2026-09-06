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
        <div className="grid gap-0 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="flex min-h-72 items-center justify-center bg-[#071A3D] p-8 text-center text-white sm:p-10">
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#F2D675]/35 bg-white/10 text-2xl font-black text-[#F2D675]">
                ✓
              </div>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-[#F2D675]">
                Verified stories only
              </p>
              <h2 className="mt-3 text-3xl font-black">Real clients. Real permission.</h2>
            </div>
          </div>

          <div className="flex min-h-72 items-center p-8 sm:p-10 lg:p-12">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
                Client Success Stories
              </p>
              <h3 className="mt-3 text-3xl font-black leading-tight text-[#071A3D]">
                Stories will appear here only after verification and client approval.
              </h3>
              <p className="mt-5 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
                Red Stone does not publish generated names, sample placements, invented travel outcomes or unverified testimonials. A story is added only after the underlying recruitment record is checked and the client has agreed to publication.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
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
            </div>
          </div>
        </div>
      </section>
    );
  }

  const previous = () =>
    setActiveIndex((current) => (current - 1 + stories.length) % stories.length);
  const next = () => setActiveIndex((current) => (current + 1) % stories.length);

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
          <div>
            <span className="inline-flex rounded-full border border-[#F2D675]/30 bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[#F2D675]">
              Verified Client
            </span>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.16em] text-slate-300">
              Destination
            </p>
            <p className="mt-1 text-3xl font-black text-white">{activeStory.destination}</p>
            <p className="mt-5 text-sm font-black uppercase tracking-[0.16em] text-slate-300">
              Recruitment Journey
            </p>
            <p className="mt-1 text-lg font-bold text-[#F2D675]">{activeStory.journeyStage}</p>
          </div>
        </div>

        <article className="flex min-h-80 items-center p-8 sm:p-10 lg:p-12" aria-live="polite">
          <div className="w-full">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
              Client Success Story
            </p>
            <blockquote className="mt-4 text-2xl font-black leading-relaxed text-[#071A3D] sm:text-3xl">
              “{activeStory.story}”
            </blockquote>
            <div className="mt-7 border-t border-slate-100 pt-6">
              <p className="text-lg font-black text-[#071A3D]">{activeStory.clientName}</p>
              <p className="mt-1 text-sm font-semibold text-slate-600">
                {activeStory.role} · {activeStory.destination}
              </p>
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
                <strong className="text-[#071A3D]">Verified outcome:</strong> {activeStory.outcome}
              </p>
            </div>
          </div>
        </article>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 px-6 py-4 sm:px-8">
        <div className="flex gap-2" aria-label="Choose a success story">
          {stories.map((story, index) => (
            <button
              key={story.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show story ${index + 1}`}
              aria-current={index === activeIndex}
              className={`h-2.5 rounded-full transition-all ${
                index === activeIndex ? "w-8 bg-[#D4AF37]" : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
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
    </section>
  );
}
