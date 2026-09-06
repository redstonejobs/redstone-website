"use client";

import { useState } from "react";

export function ReferralLinkCard({
  referralCode,
  referralLink,
}: {
  referralCode: string | null;
  referralLink: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[#071A3D] px-6 py-5 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#F2D675]">
          Client Acquisition
        </p>
        <h2 className="mt-1 text-xl font-black">My Staff Referral Link</h2>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-300">
          Share this link with prospective candidates. Registration and job applications started through it are attributed to your staff account for administration and reporting.
        </p>
      </div>

      <div className="p-6">
        {referralCode && referralLink ? (
          <>
            <div className="grid gap-4 lg:grid-cols-[180px_1fr]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Referral Code</p>
                <p className="mt-2 font-mono text-lg font-black text-[#071A3D]">{referralCode}</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Personal Referral URL</p>
                <p className="mt-2 break-all text-sm font-bold text-[#071A3D]">{referralLink}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyLink}
                    className="rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-[#071A3D] transition hover:bg-[#F2D675]"
                  >
                    {copied ? "Copied" : "Copy Referral Link"}
                  </button>
                  <a
                    href={referralLink}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-[#071A3D] px-4 py-2.5 text-xs font-black uppercase tracking-wide text-[#071A3D] transition hover:bg-[#071A3D] hover:text-white"
                  >
                    Open Link
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Your referral code is still being provisioned. Contact an administrator if it does not appear after your staff account is activated.
          </div>
        )}
      </div>
    </section>
  );
}
