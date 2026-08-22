import type { Metadata } from "next";
import { ContactForm } from "@/components/public/contact-form";
import { Band, Hero, InfoGrid } from "@/components/public/sections";
import { canonical, CONTACT } from "@/lib/public/site";

export const metadata: Metadata = { title: "Complaints & Feedback", description: "Submit complaints, feedback or suspicious activity reports to Red Stone.", alternates: { canonical: canonical("/complaints") } };

export default function ComplaintsPage() {
  return (
    <>
      <Hero eyebrow="Feedback" title="Complaints and suspicious activity reports." body="Red Stone treats complaints and fraud reports seriously. Avoid sharing unnecessary sensitive documents in the first message." />
      <Band>
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <InfoGrid items={[
            { title: "Complaints Email", body: CONTACT.emails.complaints },
            { title: "Confidentiality", body: "Complaints are reviewed through official channels. Share only information needed to understand the issue." },
            { title: "Escalation", body: "Use the complaints channel for suspected fraud, impersonation, misconduct or unresolved recruitment concerns." },
          ]} />
          <ContactForm type="complaint" />
        </div>
      </Band>
    </>
  );
}

