import type { Metadata } from "next";
import { Band, Hero, InfoGrid } from "@/components/public/sections";
import { canonical, CONTACT } from "@/lib/public/site";

export const metadata: Metadata = { title: "Fraud Awareness", description: "Learn how to verify Red Stone communications and avoid recruitment fraud.", alternates: { canonical: canonical("/fraud-awareness") } };

export default function FraudAwarenessPage() {
  return (
    <>
      <Hero eyebrow="Stay safe" title="Protect Yourself From Recruitment Fraud" body="Verify communication, question suspicious payment requests, and report impersonation through official Red Stone channels." primary={{ label: "Report Suspicious Activity", href: "/complaints" }} />
      <Band>
        <InfoGrid items={[
          { title: "Official Domain", body: "The official website is redstone.co.ke. Treat lookalike domains with caution." },
          { title: "Official Email Domain", body: "Official Red Stone email addresses use @redstone.co.ke. An official-looking email should still be verified when the request seems unusual." },
          { title: "Phone Verification", body: CONTACT.phones.join(" or ") },
          { title: "Warning Signs", body: "Guaranteed visas, vague jobs, pressure to pay quickly, and requests from personal accounts are warning signs." },
          { title: "Document Safety", body: "Do not send sensitive documents to unverified contacts or social media impersonators." },
          { title: "Report Concerns", body: `Send suspicious activity to ${CONTACT.emails.complaints}.` },
        ]} />
      </Band>
    </>
  );
}

