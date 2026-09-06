import type { Metadata } from "next";
import { ContactForm } from "@/components/public/contact-form";
import { Band, Hero, InfoGrid } from "@/components/public/sections";
import { canonical, CONTACT } from "@/lib/public/site";

export const metadata: Metadata = { title: "Contact", description: "Official Red Stone contact channels and enquiry form.", alternates: { canonical: canonical("/contact") } };

export default function ContactPage() {
  return (
    <>
      <Hero eyebrow="Contact" title="Use official Red Stone channels." body="Contact Red Stone through verified phone numbers and official @redstone.co.ke email addresses." />
      <Band>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <InfoGrid items={[
              { title: "Phone", body: CONTACT.phones.join(" / ") },
              { title: "Jobs and Employers", body: CONTACT.emails.jobs },
              { title: "Support and Complaints", body: CONTACT.emails.support },
              { title: "General", body: CONTACT.emails.general },
            ]} />
          </div>
          <ContactForm type="general" />
        </div>
      </Band>
    </>
  );
}

