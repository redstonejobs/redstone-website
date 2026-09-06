import type { Metadata } from "next";
import Link from "next/link";

import { AccountDeletionForm } from "@/components/public/account-deletion-form";
import { Band, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { canonical, CONTACT, SITE_NAME, SITE_URL } from "@/lib/public/site";

const faqs = [
  {
    question: "Does submitting this form instantly delete my Red Stone account?",
    answer:
      "No. The form creates an account-deletion request. Red Stone must first identify the relevant account and may need to verify that the request came from the account holder before irreversible deletion or closure is carried out.",
  },
  {
    question: "What information can I ask Red Stone to delete?",
    answer:
      "You may request closure of your account and deletion of personal information that Red Stone is eligible to erase. The exact records depend on your account type, applications, communications, documents, payment history, recruitment activity and any legal or operational retention requirement that applies to the record.",
  },
  {
    question: "Will every record be deleted immediately?",
    answer:
      "Not necessarily. Some records may need to be retained for a limited period where required for legal compliance, accounting, fraud prevention, safeguarding, dispute resolution, security, regulatory obligations or the establishment, exercise or defence of legal claims. Data that no longer needs to identify you should be deleted or de-identified where appropriate.",
  },
  {
    question: "What happens to an active job application if I request account deletion?",
    answer:
      "Account deletion can affect access to applications, uploaded documents, messages and recruitment progress. If you have an active application and are unsure whether you want it withdrawn, choose the option asking Red Stone to contact you before processing the request.",
  },
  {
    question: "Can I reopen my account after deletion?",
    answer:
      "A completed deletion may be irreversible. You may need to create a new account and submit information again. Records that were lawfully retained for compliance or dispute purposes do not automatically recreate the deleted account.",
  },
  {
    question: "How does Red Stone verify an account-deletion request?",
    answer:
      "Red Stone may compare the request with account information and may contact the requester through the email address or another verified channel associated with the account. Never send a password, PIN, OTP, card security code or recovery code as proof of identity.",
  },
  {
    question: "Can I request deletion if I no longer have access to my account?",
    answer:
      "Yes. Submit the form using the email address associated with the account if possible and provide enough non-sensitive information to help locate the record. Additional verification may be required before any account or personal data is deleted.",
  },
  {
    question: "What if I only want incorrect information corrected rather than deleted?",
    answer:
      "You do not need to delete your account to request a correction. Contact Red Stone support or use the appropriate privacy or support channel and explain which information is inaccurate and what correction you are requesting.",
  },
];

export const metadata: Metadata = {
  title: "Account Deletion & Personal Data Erasure Request | Red Stone",
  description:
    "Request closure of your Red Stone Employment Agency account and deletion of eligible personal data. Learn about identity verification, active applications, retained records and the account-deletion process.",
  keywords: [
    "Red Stone account deletion",
    "delete Red Stone account",
    "delete recruitment account Kenya",
    "personal data deletion request",
    "data erasure request Kenya",
    "candidate account deletion",
    "employer account deletion",
    "Red Stone privacy request",
  ],
  alternates: { canonical: canonical("/account-deletion") },
  openGraph: {
    title: "Account Deletion & Data Erasure | Red Stone Employment Agency",
    description:
      "Official Red Stone process for requesting account closure and deletion of eligible personal information.",
    url: canonical("/account-deletion"),
    type: "website",
    siteName: SITE_NAME,
  },
};

export default function AccountDeletionPage() {
  const pageUrl = canonical("/account-deletion");

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Account Deletion and Personal Data Erasure Request",
            description:
              "Official Red Stone Employment Agency page for requesting account closure and deletion of eligible personal data.",
            url: pageUrl,
            dateModified: "2026-09-06",
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Account Deletion", item: pageUrl },
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
              Privacy · account closure · personal data requests
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Account Deletion & Personal Data Erasure
            </h1>
            <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
              Red Stone provides an official process for candidates, employers and website users who want to close an account or request deletion of eligible personal information. Requests are verified before irreversible action is taken.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#request-deletion" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] hover:bg-[#F2D675]">
                Submit Deletion Request
              </a>
              <Link href="/privacy" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white hover:bg-white/15">
                Privacy Policy
              </Link>
              <Link href="/contact" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white hover:bg-white/15">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="What this process does"
          title="Account closure and data deletion are handled as verified privacy requests"
          body="Red Stone should not irreversibly delete an account merely because someone knows an email address. The request is matched to the account and may require identity or account-ownership verification first."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Request received", "The website records the request and issues an RSEA-DEL tracking reference."],
            ["Account matched", "Red Stone identifies the candidate, employer or website account connected to the request."],
            ["Ownership verified", "The requester may be contacted through an account-linked email or another verified channel."],
            ["Deletion reviewed", "Eligible data is deleted or de-identified while limited records may be retained where lawfully necessary."],
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
          eyebrow="What may be affected"
          title="Understand what can change when an account is deleted"
          body="Account deletion can affect more than login access. Review the areas below before submitting an irreversible request."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["Login and profile", "Your sign-in access and editable account profile may be closed or deleted after verification and completion."],
            ["Applications", "Active and historical application access may be removed. An active recruitment case may need to be withdrawn or separately handled."],
            ["Uploaded documents", "Eligible stored CVs, passports, certificates and other uploaded candidate documents may be deleted, subject to lawful retention requirements."],
            ["Messages and support history", "Personal communication may be removed, de-identified or retained in limited form where needed to preserve legitimate case, complaint or security records."],
            ["Payment records", "Financial and transaction records may need to be retained where accounting, tax, fraud-prevention, dispute or other legal obligations apply."],
            ["Employer records", "Employer account deletion may affect vacancy management, recruitment communications and access to employer-side records, while lawful business records may still need to be retained."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#071A3D]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band>
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-3xl border border-emerald-100 bg-emerald-50 p-7 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Normally eligible for deletion or de-identification</p>
            <h2 className="mt-3 text-2xl font-black text-[#071A3D]">Information no longer needed for a lawful purpose</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-slate-700">
              {[
                "Unused profile information after account closure",
                "Eligible application documents no longer required for an active or retained record",
                "Optional preference data that no longer needs to be associated with the person",
                "Duplicate records that have no continuing operational or legal purpose",
                "Other personal information for which Red Stone no longer has a lawful retention reason",
              ].map((item) => <li key={item} className="flex gap-3"><span className="font-black text-emerald-700">✓</span><span>{item}</span></li>)}
            </ul>
          </article>

          <article className="rounded-3xl border border-amber-200 bg-amber-50 p-7 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-800">May require limited retention</p>
            <h2 className="mt-3 text-2xl font-black text-[#071A3D]">Some records cannot always be erased immediately</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-slate-700">
              {[
                "Accounting, payment, receipt and transaction records",
                "Fraud-prevention, security and abuse records",
                "Complaint, dispute or legal-claim records",
                "Records required by a regulator, court, government authority or applicable law",
                "Safeguarding or compliance records that must be preserved for a legitimate legal reason",
              ].map((item) => <li key={item} className="flex gap-3"><span className="font-black text-amber-800">•</span><span>{item}</span></li>)}
            </ul>
            <p className="mt-5 text-xs leading-6 text-amber-950/80">
              Retention should be limited to what is actually necessary. A deletion request does not authorize Red Stone to keep unrelated personal information indefinitely.
            </p>
          </article>
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Deletion workflow"
          title="How an account deletion request is handled"
          body="The exact path can vary depending on account type, active recruitment activity, identity verification and records that must lawfully be retained."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["01", "Submit the request", "Use the official form with the email address associated with the account and choose the requested scope."],
            ["02", "Receive a reference", "A successful submission receives an RSEA-DEL reference. Keep it for follow-up."],
            ["03", "Verify account ownership", "Red Stone may contact you through an account-linked or otherwise verified channel before irreversible action."],
            ["04", "Review active records", "Open applications, employer activity, payments, complaints and other live matters are checked before deletion proceeds."],
            ["05", "Delete or de-identify eligible data", "Account access and eligible personal information are removed or de-identified according to the verified request."],
            ["06", "Restrict retained records", "Any information that must remain should be limited to the purpose and retention obligation that requires it."],
          ].map(([step, title, body]) => (
            <article key={step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#071A3D] text-sm font-black text-[#F2D675]">{step}</span>
              <h2 className="mt-5 text-xl font-black text-[#071A3D]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band id="request-deletion">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Official request form"
            title="Request account deletion"
            body={`Use the account email address where possible. If the form is unavailable, contact ${CONTACT.emails.support} through an official Red Stone channel.`}
          />
          <div className="mt-10">
            <AccountDeletionForm />
          </div>
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading eyebrow="Frequently asked questions" title="Account deletion and data-erasure FAQs" />
        <div className="mx-auto mt-10 max-w-5xl space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <summary className="cursor-pointer list-none text-lg font-black leading-7 text-[#071A3D]">{faq.question}</summary>
              <p className="mt-4 text-sm leading-8 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band>
        <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Need a different privacy action?</p>
          <h2 className="mt-2 text-3xl font-black text-[#071A3D]">Deletion is not the only way to control your information</h2>
          <p className="mt-4 text-sm leading-8 text-slate-600">
            If your goal is to correct inaccurate information, understand how data is used, raise a privacy concern or stop a particular communication, you may not need to delete the entire account. Review the Privacy Policy or contact Red Stone support with the specific request.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/privacy" className="rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Privacy Policy</Link>
            <Link href="/complaints" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-[#071A3D]">Privacy Complaint</Link>
            <Link href="/contact" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-[#071A3D]">Contact Support</Link>
          </div>
        </div>
      </Band>
    </main>
  );
}
