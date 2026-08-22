import type { Metadata } from "next";
import { LegalPage } from "@/components/public/legal-page";
import { canonical, CONTACT } from "@/lib/public/site";

export const metadata: Metadata = { title: "Accessibility", alternates: { canonical: canonical("/accessibility") } };

export default function AccessibilityPage() {
  return <LegalPage title="Accessibility" sections={[
    ["Commitment", "Red Stone aims to provide accessible digital services with clear structure, readable content and keyboard-friendly navigation."],
    ["Feedback", `Accessibility feedback can be sent to ${CONTACT.emails.support}.`],
    ["Ongoing Work", "This page does not claim formal WCAG certification. Accessibility should continue to be tested before production launch."],
  ]} />;
}

