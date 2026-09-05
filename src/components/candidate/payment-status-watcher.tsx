"use client";

import { useEffect, useState } from "react";

type Props = {
  applicationId: string;
  reference: string;
  initialStatus: string;
};

const TERMINAL_STATUSES = new Set(["paid", "failed", "cancelled", "expired"]);

export function PaymentStatusWatcher({ applicationId, reference, initialStatus }: Props) {
  const [status, setStatus] = useState(initialStatus);

  useEffect(() => {
    if (!reference || !["initiated", "pending"].includes(initialStatus)) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 40;

    const poll = async () => {
      if (cancelled || attempts >= maxAttempts) return;
      attempts += 1;

      try {
        const response = await fetch(`/api/payments/${encodeURIComponent(reference)}/status`, {
          cache: "no-store",
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) return;

        const payload = (await response.json()) as { status?: string };
        const nextStatus = typeof payload.status === "string" ? payload.status : initialStatus;
        setStatus(nextStatus);

        if (TERMINAL_STATUSES.has(nextStatus)) {
          const params = new URLSearchParams({
            section: "payment",
            payment: nextStatus,
            reference,
          });
          window.location.replace(`/candidate/applications/${applicationId}?${params.toString()}`);
        }
      } catch {
        // A temporary polling failure must not interrupt the candidate form.
      }
    };

    const timer = window.setInterval(poll, 3000);
    void poll();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [applicationId, initialStatus, reference]);

  if (!["initiated", "pending"].includes(status)) return null;

  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
      <p className="font-black">Waiting for M-Pesa confirmation</p>
      <p className="mt-1 leading-6">
        Complete or cancel the STK prompt on your phone. This page will update automatically when Safaricom confirms the result.
      </p>
    </div>
  );
}
