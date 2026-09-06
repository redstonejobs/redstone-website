import type { Metadata } from "next";
import Link from "next/link";

import { DataProtectionRequestForm } from "@/components/public/data-protection-request-form";
import { Band, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { canonical, CONTACT, SITE_NAME, SITE_URL } from "@/lib/public/site";

const rights = [
  ["Be informed", "Ask what personal data Red Stone collects, the purposes for which it is used, the categories of recipients involved and other relevant processing information."],
  ["Access", "Request access to personal data that Red Stone holds about you, subject to identity verification and any lawful limitations."],
  ["Correction", "Ask Red Stone to correct personal data that is inaccurate, incomplete, false or misleading."],
  ["Object", "Object to all or part of a processing activity where applicable and explain the processing you want Red Stone to review."],
  ["Restriction", "Ask Red Stone to limit a processing activity where that right is available under applicable data-protection law."],
  ["Erasure", "Request deletion of eligible personal data. Some records may still need limited lawful retention for accounting, security, disputes, safeguarding or regulatory obligations."],
  ["Portability", "Where applicable, request personal data in a structured, commonly used and machine-readable format or ask for an eligible transfer to another controller."],
  ["Consent review", "Where a processing activity depends on consent, ask Red Stone to explain it, update your choice or record a withdrawal, subject to any other lawful basis that may still apply."],
] as const;

const faqs = [
  {
    question: "What law guides personal-data protection in Kenya?",
    answer: "Red Stone's Kenyan data-protection framework should be read together with the Data Protection Act, 2019, its applicable regulations, guidance from the Office of the Data Protection Commissioner and any other law that applies to a specific recruitment, employment, financial, medical or immigration record.",
  },
  {
    question: "What personal data can Red Stone process during recruitment?",
    answer: "Depending on the service, this can include identity and contact information, CV and employment history, qualifications, application records, passport or travel-document information, compliance documents, limited medical or health-related recruitment records where necessary, payment references, communications, employer-recruitment records and website security or technical logs.",
  },
  {
    question: "Does Red Stone sell candidate personal data?",
    answer: "The recruitment purpose is to use personal data for legitimate recruitment, candidate support, employer coordination, security, compliance and related operational needs. Personal data should not be sold as a commodity. Any disclosure must have an appropriate purpose and legal basis and should be limited to what is necessary.",
  },
  {
    question: "Can my data be shared with overseas employers?",
    answer: "International recruitment can require relevant candidate information to be shared with a prospective or selected employer, service provider or authority outside Kenya. Red Stone should limit the information shared, use an appropriate lawful basis and apply the safeguards required for cross-border processing or transfer.",
  },
  {
    question: "How long does Red Stone keep personal information?",
    answer: "Personal information should not be kept in identifiable form for longer than necessary for the purpose for which it was collected, subject to legitimate retention needs such as accounting, fraud prevention, complaints, legal claims, safeguarding, regulatory obligations and active recruitment records.",
  },
  {
    question: "Can I ask Red Stone for a copy of my personal data?",
    answer: "Yes. Use the data protection request form and select access. Red Stone may verify your identity before releasing personal data so that information is not disclosed to the wrong person.",
  },
  {
    question: "What should I do if my personal data is wrong?",
    answer: "Submit a correction request identifying the inaccurate or misleading information and, where appropriate, provide the correct information or supporting context. Do not send unnecessary sensitive documents in the first request.",
  },
  {
    question: "What if I believe my personal data has been mishandled?",
    answer: "Submit a data protection request or complaint to Red Stone and keep the reference. If the concern is not resolved, you may also have rights to use the complaint or enforcement channels available through the Office of the Data Protection Commissioner or another competent authority.",
  },
];

export const metadata: Metadata = {
  title: "Data Protection | Privacy Rights, Access, Correction & Erasure",
  description:
    "Red Stone Employment Agency data protection page covering candidate privacy, personal-data processing, data-subject rights, access, correction, objection, erasure, portability, retention, security and international recruitment transfers.",
  keywords: [
    "Red Stone data protection",
    "data protection recruitment Kenya",
    "Kenya Data Protection Act recruitment",
    "candidate privacy Kenya",
    "personal data access request Kenya",
    "data erasure recruitment",
    "data portability Kenya",
    "international recruitment privacy",
    "ODPC recruitment data protection",
  ],
  alternates: { canonical: canonical("/data-protection") },
  openGraph: {
    title: "Data Protection & Privacy Rights | Red Stone Employment Agency",
    description:
      "Understand how Red Stone handles recruitment data and how to exercise access, correction, objection, restriction, erasure and portability rights.",
    url: canonical("/data-protection"),
    type: "website",
    siteName: SITE_NAME,
  },
};

export default function DataProtectionPage() {
  const pageUrl = canonical("/data-protection");

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Data Protection and Privacy Rights",
            description:
              "Red Stone Employment Agency information about recruitment-data protection, privacy principles and data-subject rights.",
            url: pageUrl,
            dateModified: "2026-09-06",
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Data Protection", item: pageUrl },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: { "@type": "Answer", text: faq.answer },
            })),
          },
        ]}
      />

      <section className="relative overflow-hidden bg-[#071A3D] text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-[#071A3D] via-[#0D2B59] to-[#071A3D]" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="max-w-5xl">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
              Privacy · recruitment data · data-subject rights
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Data Protection & Privacy Rights</h1>
            <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
              International recruitment requires careful handling of identity, employment, document, payment and compliance information. Red Stone aims to process personal data lawfully, fairly, transparently and only for legitimate recruitment, support, security and compliance purposes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#data-rights-request" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] hover:bg-[#F2D675]">
                Exercise a Privacy Right
              </a>
              <Link href="/privacy" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white hover:bg-white/15">
                Privacy Policy
              </Link>
              <Link href="/account-deletion" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white hover:bg-white/15">
                Account Deletion
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="Kenyan privacy framework"
          title="Recruitment data should be handled under clear data-protection principles"
          body="Red Stone's Kenyan operations should be read in the context of the Data Protection Act, 2019, applicable regulations and guidance from the Office of the Data Protection Commissioner. Mandatory legal requirements take priority over general website guidance."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Lawful, fair & transparent", "Personal data should have a legitimate processing purpose and people should receive understandable information about how it is used."],
            ["Purpose limitation", "Information collected for recruitment, verification, support, compliance or another specified purpose should not be reused incompatibly without an appropriate basis."],
            ["Data minimisation", "Collect and disclose only information that is adequate, relevant and reasonably necessary for the recruitment or compliance purpose involved."],
            ["Accuracy", "Candidate, employer and account records should be kept reasonably accurate and corrected when material inaccuracies are identified."],
            ["Retention limitation", "Identifiable personal data should not be kept longer than necessary, except where a legitimate legal, accounting, security or dispute-retention requirement applies."],
            ["Security", "Appropriate organizational and technical safeguards should be used to reduce risks such as unauthorized access, accidental loss, alteration or disclosure."],
            ["Accountability", "Red Stone should be able to explain the purposes, records, service providers and safeguards involved in material processing activities."],
            ["Cross-border safeguards", "International transfers should use the safeguards, legal grounds or other protections required when recruitment data moves outside Kenya."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 h-1.5 w-12 rounded-full bg-[#D4AF37]" />
              <h2 className="text-xl font-black text-[#071A3D]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Recruitment information"
          title="What kinds of personal data may be involved"
          body="The exact information depends on the candidate, employer, vacancy, destination and stage of recruitment. Red Stone should avoid collecting data merely because it may be useful later."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Identity & contact", "Name, contact details, account identifiers, nationality or other identity information needed to identify and communicate with the person."],
            ["Career & application", "CV, work history, skills, qualifications, references, job preferences, applications, interview records and employer-selection information."],
            ["Travel & immigration", "Passport or travel-document details, destination information, work-authorization records and other documents required for an actual immigration or deployment step."],
            ["Compliance & documents", "Good-conduct, licensing, qualification-recognition, medical-status or other compliance information where genuinely required for the vacancy or destination."],
            ["Payments & transactions", "Payment status, invoice or receipt details, M-Pesa or bank transaction references and related accounting records. PINs and passwords should never be collected through public forms."],
            ["Communications & support", "Emails, messages, support enquiries, complaints, refund requests and records of instructions given through official channels."],
            ["Employer information", "Employer contacts, vacancy information, recruitment instructions, hiring decisions and other business information needed to coordinate recruitment services."],
            ["Technical & security data", "Authentication, security, device, session, abuse-prevention or technical logs that may be needed to operate and protect the website and user accounts."],
            ["Sensitive information", "Health, biometric or other sensitive personal data should be processed only when necessary, with a suitable legal basis, tighter access controls and appropriate safeguards."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#071A3D]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Why data is used"
          title="Processing should be connected to a legitimate and understandable purpose"
          body="A recruitment website can process several categories of data, but the reason for each processing activity should be defined and proportionate."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Recruitment & placement", "Create applications, assess vacancy fit, communicate with candidates, coordinate interviews and support employer recruitment decisions."],
            ["Document & eligibility support", "Review documents, identify missing information, prepare application records and support destination-specific compliance steps."],
            ["Employer services", "Coordinate lawful recruitment with employers, share relevant shortlisted-candidate information and manage vacancy-related communication."],
            ["Payments & administration", "Record service charges, payment status, receipts, refunds, disputes and other financial or administrative activity."],
            ["Safety, fraud & security", "Protect accounts, investigate impersonation or suspicious activity, prevent abuse and preserve evidence where necessary."],
            ["Legal & regulatory compliance", "Meet obligations relating to recruitment, accounting, data protection, investigations, lawful requests, disputes and other applicable requirements."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#071A3D]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Your privacy rights"
          title="You can ask Red Stone to explain, access, correct or review personal-data processing"
          body="The availability and scope of a right can depend on the law, the processing purpose and whether another lawful obligation requires Red Stone to retain or continue processing a limited record."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {rights.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#B8860B]">Data-subject right</p>
              <h2 className="mt-2 text-xl font-black text-[#071A3D]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Sharing & international recruitment"
          title="Personal data should only be shared when the recruitment or compliance purpose requires it"
          body="International recruitment can involve several independent organizations. Red Stone should disclose only the information reasonably necessary for the relevant stage."
        />
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-[#071A3D] text-white">
                <tr><th className="p-4">Recipient category</th><th className="p-4">Why information may be shared</th><th className="p-4">Control principle</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr><td className="p-4 font-black text-[#071A3D]">Prospective / selected employers</td><td className="p-4">Shortlisting, interviews, qualification assessment, offers and recruitment decisions.</td><td className="p-4">Share only information relevant to the vacancy and recruitment stage.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Medical or compliance providers</td><td className="p-4">Where a lawful recruitment process requires a specific examination, verification or compliance service.</td><td className="p-4">Sensitive data should receive stricter access and disclosure controls.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Government / immigration authorities</td><td className="p-4">Work authorization, visa, residence, identity, regulatory or lawful official processes.</td><td className="p-4">Official authorities determine their own legal document requirements.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Technology / service providers</td><td className="p-4">Hosting, authentication, databases, storage, communication, security and other operational services.</td><td className="p-4">Use providers under appropriate terms, permissions and security controls.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Professional / regulatory bodies</td><td className="p-4">Qualification recognition, licensing or another regulated-occupation requirement.</td><td className="p-4">Limit disclosure to what the competent body reasonably requires.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Law enforcement / legal recipients</td><td className="p-4">Only where disclosure is lawfully required or justified for security, fraud, safeguarding, legal claims or another valid purpose.</td><td className="p-4">Validate the request and disclose only what is lawfully necessary.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </Band>

      <Band tone="grey">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Retention</p>
            <h2 className="mt-3 text-2xl font-black text-[#071A3D]">Keep personal data only for as long as it has a legitimate purpose</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Different records can require different retention periods. Active applications may need current recruitment records, while transaction, complaint, security or regulatory records may need to be preserved for a longer lawful period. When identifiable data is no longer required, deletion or appropriate de-identification should be considered.
            </p>
          </article>
          <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Security</p>
            <h2 className="mt-3 text-2xl font-black text-[#071A3D]">Protect data through access control, secure systems and careful handling</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Security should include appropriate authentication, role-based access, protected storage and transport, limited staff access, logging, incident handling and staff practices that reduce unnecessary copying or disclosure. No security measure can eliminate every risk, so suspected incidents should be investigated and escalated promptly.
            </p>
          </article>
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Privacy request process"
          title="How Red Stone should handle a data-subject request"
          body="The requester receives a tracking reference, but the requested action may require verification and case review before completion."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["1. Submit", "Use the official form and describe the right or processing activity involved."],
            ["2. Log & identify", "Red Stone records the RSEA-DPR reference and identifies the relevant account, application or data set."],
            ["3. Verify where necessary", "Identity or authority may be checked before personal information is disclosed, changed, exported or erased."],
            ["4. Review & respond", "The request is assessed against the actual records, processing purpose, applicable law and any lawful limitation or retention obligation."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#071A3D]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey" id="data-rights-request">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Exercise your rights</p>
            <h2 className="mt-3 text-3xl font-black text-[#071A3D]">Official Data Protection Request</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              This form covers access, correction, objection, restriction, portability, erasure and general privacy questions. For complete account closure, you can also use the dedicated Account Deletion page.
            </p>
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm leading-7 text-slate-600">
              <p><strong className="text-[#071A3D]">Privacy support:</strong> {CONTACT.emails.support}</p>
              <p className="mt-2">Use official channels and keep the request reference for follow-up.</p>
              <p className="mt-4 text-xs leading-6 text-slate-500">Do not send passwords, PINs, OTP codes or unnecessary identity documents with an initial request.</p>
            </div>
          </div>
          <DataProtectionRequestForm />
        </div>
      </Band>

      <Band>
        <SectionHeading eyebrow="Frequently asked questions" title="Data protection questions" />
        <div className="mx-auto mt-10 grid max-w-5xl gap-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <summary className="cursor-pointer list-none font-black text-[#071A3D]">{faq.question}</summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band tone="navy">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Independent privacy regulator</p>
            <h2 className="mt-3 text-3xl font-black text-white">Office of the Data Protection Commissioner</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
              Red Stone's internal privacy process does not remove any right a person may have to use the complaint or enforcement mechanisms available through Kenya's Office of the Data Protection Commissioner or another competent authority.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="https://www.odpc.go.ke/rights-of-a-data-subject/" target="_blank" rel="noreferrer" className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">ODPC Data-Subject Rights</a>
            <a href="https://www.odpc.go.ke/data-protection-laws-kenya/" target="_blank" rel="noreferrer" className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white">Kenya Data Protection Laws</a>
          </div>
        </div>
      </Band>

      <Band>
        <div className="mx-auto max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-950">
          <strong>Legal note:</strong> This page describes Red Stone's operational data-protection approach and privacy-request process. It does not replace the Data Protection Act, regulations, binding regulatory guidance, court orders, contractual obligations or advice from qualified legal counsel. Where there is a conflict, applicable law and binding legal requirements prevail.
        </div>
      </Band>
    </main>
  );
}
