"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentStatusRefresher({
  active,
}: {
  active: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    const startedAt = Date.now();

    const timer = window.setInterval(() => {
      if (Date.now() - startedAt >= 120_000) {
        window.clearInterval(timer);
        return;
      }

      router.refresh();
    }, 3000);

    return () => window.clearInterval(timer);
  }, [active, router]);

  return null;
}