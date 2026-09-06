"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useState } from "react";

import {
  subscribeNewsletter,
  type NewsletterState,
} from "@/lib/public/newsletter-actions";

const initialState: NewsletterState = { ok: false, message: "" };

export function FloatingEngagementDock({
  whatsappPhone,
  callPhone,
}: {
  whatsappPhone: string;
  callPhone: string;
}) {
  const pathname = usePathname();
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [state, formAction, pending] = useActionState(subscribeNewsletter, initialState);

  const whatsappDigits = whatsappPhone.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
    "Hello Red Stone Employment Agency. I am visiting redstone.co.ke and would like assistance.",
  )}`;

  function currentUrl() {
    return typeof window === "undefined"
      ? `https://redstone.co.ke${pathname}`
      : window.location.href;
  }

  function shareTo(platform: "facebook" | "linkedin" | "x" | "whatsapp") {
    const url = encodeURIComponent(currentUrl());
    const text = encodeURIComponent(document.title || "Red Stone Employment Agency");
    const destinations = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    };
    window.open(destinations[platform], "_blank", "noopener,noreferrer");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      {subscribeOpen ? (
        <aside className="fixed bottom-24 left-3 right-3 z-[70] mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl lg:bottom-6 lg:left-auto lg:right-28 lg:mx-0 lg:w-[420px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Free updates</p>
              <h2 className="mt-1 text-2xl font-black text-[#071A3D]">Subscribe to Red Stone</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Receive useful jobs, recruitment, blog, document and candidate-guidance updates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSubscribeOpen(false)}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-black text-slate-600"
              aria-label="Close subscription panel"
            >
              ×
            </button>
          </div>

          <form action={formAction} className="mt-5 space-y-3">
            <input type="hidden" name="source_path" value={pathname} />
            <div className="hidden" aria-hidden="true">
              <label>
                Company website
                <input name="company_website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
            <input
              name="full_name"
              type="text"
              maxLength={120}
              placeholder="Your name (optional)"
              className="min-h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
            />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Email address"
              className="min-h-12 w-full rounded-xl border border-slate-300 px-4 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
            />
            <label className="flex items-start gap-3 text-xs leading-5 text-slate-600">
              <input name="consent" value="yes" type="checkbox" required className="mt-1 h-4 w-4 accent-[#D4AF37]" />
              <span>
                I agree to receive Red Stone recruitment, jobs, blog and candidate-guidance updates by email. I can request to unsubscribe at any time.
              </span>
            </label>
            <button
              type="submit"
              disabled={pending}
              className="min-h-12 w-full rounded-xl bg-[#071A3D] px-5 text-sm font-black text-white transition hover:bg-[#102D5A] disabled:cursor-wait disabled:opacity-60"
            >
              {pending ? "Subscribing…" : "Subscribe for Updates"}
            </button>
            {state.message ? (
              <p className={`rounded-xl p-3 text-xs font-semibold leading-5 ${state.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>
                {state.message}
              </p>
            ) : null}
            <p className="text-[11px] leading-5 text-slate-500">
              Your email is used for Red Stone updates. See our <Link href="/privacy" className="font-black text-[#071A3D] underline">Privacy Policy</Link> and <Link href="/data-protection" className="font-black text-[#071A3D] underline">Data Protection</Link> page.
            </p>
          </form>
        </aside>
      ) : null}

      {shareOpen ? (
        <aside className="fixed bottom-24 left-3 right-3 z-[70] mx-auto max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl lg:bottom-6 lg:left-auto lg:right-28 lg:mx-0 lg:w-[350px]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Social sharing</p>
              <h2 className="mt-1 text-xl font-black text-[#071A3D]">Share this page</h2>
            </div>
            <button type="button" onClick={() => setShareOpen(false)} className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-black text-slate-600" aria-label="Close share panel">×</button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <ShareButton label="Facebook" onClick={() => shareTo("facebook")} />
            <ShareButton label="LinkedIn" onClick={() => shareTo("linkedin")} />
            <ShareButton label="X / Twitter" onClick={() => shareTo("x")} />
            <ShareButton label="WhatsApp" onClick={() => shareTo("whatsapp")} />
            <button type="button" onClick={copyLink} className="col-span-2 min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-black text-[#071A3D] hover:border-[#D4AF37]">
              {copied ? "Link copied ✓" : "Copy page link"}
            </button>
          </div>
        </aside>
      ) : null}

      <div className="fixed bottom-3 left-3 right-3 z-[60] flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-2xl backdrop-blur lg:bottom-6 lg:left-auto lg:right-6 lg:flex-col lg:items-stretch lg:rounded-3xl">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-black text-white shadow-sm hover:bg-emerald-700"
          aria-label="Chat with Red Stone on WhatsApp"
        >
          <span className="hidden sm:inline">WhatsApp</span><span className="sm:hidden">WA</span>
        </a>
        <button
          type="button"
          onClick={() => {
            setSubscribeOpen((open) => !open);
            setShareOpen(false);
          }}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#D4AF37] px-4 text-sm font-black text-[#071A3D] shadow-sm hover:bg-[#F2D675]"
          aria-expanded={subscribeOpen}
        >
          Subscribe
        </button>
        <button
          type="button"
          onClick={() => {
            setShareOpen((open) => !open);
            setSubscribeOpen(false);
          }}
          className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-[#071A3D] hover:border-[#D4AF37]"
          aria-expanded={shareOpen}
        >
          Share
        </button>
        <a
          href={`tel:${callPhone.replace(/\s/g, "")}`}
          className="hidden min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-[#071A3D] hover:border-[#D4AF37] sm:inline-flex"
        >
          Call
        </a>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="hidden min-h-10 items-center justify-center rounded-xl bg-slate-100 px-3 text-xs font-black text-slate-700 hover:bg-slate-200 lg:inline-flex"
          aria-label="Back to top"
        >
          ↑ Top
        </button>
      </div>
    </>
  );
}

function ShareButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-black text-[#071A3D] hover:border-[#D4AF37] hover:bg-amber-50"
    >
      {label}
    </button>
  );
}
