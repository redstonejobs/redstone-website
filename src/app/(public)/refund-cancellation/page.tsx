import type { Metadata } from "next";
import Link from "next/link";

import { RefundRequestForm } from "@/components/public/refund-request-form";
import { Band, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { canonical, CONTACT, SITE_NAME, SITE_URL } from "@/lib/public/site";

const faqs = [
  {
    question: "Does cancelling an application automatically mean I receive a refund?",
    answer: "No. Cancellation and refund eligibility are separate. A candidate may request cancellation of a Red Stone service or recruitment case, but any refund depends on the payment type, work already completed, third-party charges, the written programme terms and applicable law.",
  },
  {
    question: "Can a duplicate or incorrect payment be refunded?",
    answer: "A duplicate payment, payment taken in error or clearly incorrect payment can be submitted for review. Red Stone will normally need to verify the transaction, payer, amount and the service connected to it before any refund is approved.",
  },
  {
    question: "Is the CV and document verification fee refundable?",
    answer: "The CV and document verification fee pays for application-processing and verification work. If the service has already started or been completed, it is generally not refundable simply because the candidate later changes their mind or is not selected. Duplicate payments, mistaken payments, or a service Red Stone did not provide can still be reviewed, and applicable law always takes priority.",
  },
  {
    question: "Are medical, visa or government charges refundable by Red Stone?",
    answer: "Charges paid directly to a hospital, medical provider, embassy, visa centre, government authority, police service, airline or other independent provider are normally governed by that provider's own refund rules. Red Stone cannot promise a refund of money it did not retain or control.",
  },
  {
    question: "What happens if an employer rejects my application or a visa is refused?",
    answer: "Employer rejection, vacancy closure, medical findings, licensing decisions or a government visa or work-permit refusal do not automatically make Red Stone service fees refundable. Refund eligibility depends on what service was paid for and whether that service was delivered, together with any specific written programme refund condition.",
  },
  {
    question: "What if my programme has a written maximum processing period and refund promise?",
    answer: "Where a specific Red Stone programme, signed agreement, invoice or written offer states a maximum processing period and a defined refund condition, that written condition should be reviewed as part of the refund decision. General website estimates do not replace specific written programme terms.",
  },
  {
    question: "How do I request a refund or cancellation?",
    answer: "Use the official form on this page and provide your application reference, payment reference, amount, date, payment method and reason. A successful submission receives an RSEA-RFD reference for follow-up.",
  },
  {
    question: "How long does a refund review take?",
    answer: "The time depends on whether Red Stone can immediately verify the payment and service record or needs information from finance staff, an employer or a third-party provider. The request reference confirms receipt, not approval or a guaranteed payment date.",
  },
];

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Recruitment Fees and Requests",
  description:
    "Read Red Stone Employment Agency's refund and cancellation policy for recruitment services, programme fees, application verification, third-party costs, cancellations and refund-request procedures.",
  keywords: [
    "Red Stone refund policy",
    "recruitment refund policy Kenya",
    "employment agency cancellation policy",
    "recruitment fee refund",
    "job application fee refund",
    "Red Stone cancellation request",
    "recruitment programme refund",
  ],
  alternates: { canonical: canonical("/refund-cancellation") },
  openGraph: {
    title: "Refund & Cancellation Policy | Red Stone Employment Agency",
    description:
      "Understand how cancellations, Red Stone service fees, programme charges and third-party payments are reviewed, and submit an official refund request.",
    url: canonical("/refund-cancellation"),
    type: "website",
    siteName: SITE_NAME,
  },
};

export default function RefundCancellationPage() {
  const pageUrl = canonical("/refund-cancellation");

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Refund & Cancellation Policy",
            description: "Red Stone Employment Agency policy for recruitment-service cancellations and refund requests.",
            url: pageUrl,
            dateModified: "2026-09-06",
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Refund & Cancellation", item: pageUrl },
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
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">Payments · cancellations · refund reviews</p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Refund & Cancellation Policy</h1>
            <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
              This page explains how Red Stone reviews cancellation and refund requests, including application-processing fees, recruitment programme charges, duplicate payments and costs paid to independent third parties such as medical providers, government authorities and airlines.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#request-refund" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] hover:bg-[#F2D675]">Request Refund Review</a>
              <Link href="/complaints" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white hover:bg-white/15">Complaints Procedure</Link>
              <Link href="/terms" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white hover:bg-white/15">Terms of Use</Link>
            </div>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="Core principle"
          title="A refund depends on what was paid for and what work has already been done"
          body="Red Stone separates its own recruitment-service charges from money collected by or paid to independent providers. Cancellation of a case does not automatically reverse services already delivered or external costs already incurred."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Red Stone service fees", "Reviewed according to the service purchased, work completed, written programme terms and applicable law."],
            ["Third-party charges", "Medical, government, visa-centre, police, airline, courier and similar charges generally follow the third party's own refund rules."],
            ["Written programme terms", "A specific signed agreement, invoice or written programme refund condition takes priority over a general website estimate for that case."],
            ["No outcome guarantee", "Employer selection, medical results, licensing and immigration decisions are outside Red Stone's sole control and do not automatically create a refund right."],
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
          eyebrow="Possible refund situations"
          title="Requests that may qualify for a refund review"
          body="The examples below are not automatic approvals. Each request is checked against payment records, service activity and any case-specific written terms."
        />
        <div className="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-2">
          {[
            ["Duplicate payment", "The same Red Stone charge was paid more than once and the duplicate can be verified."],
            ["Payment taken in error", "A payment was made to Red Stone for the wrong amount, wrong service or wrong candidate and the mistake can be verified."],
            ["Paid service not provided", "Red Stone accepted payment for a defined service but did not perform that service and no equivalent service or authorized cost was supplied."],
            ["Red Stone cancels before work begins", "A Red Stone-controlled paid service is cancelled before substantive processing begins and no non-refundable third-party cost has been incurred."],
            ["Specific written refund condition is met", "A programme agreement, invoice, offer or other written Red Stone term contains a defined refund condition and the candidate can show that the condition has been met."],
            ["Legal entitlement", "A refund, reversal or remedy is required by applicable consumer, contract or other law, regardless of the general website wording."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-emerald-700">May be reviewable</p>
              <h2 className="mt-2 text-xl font-black text-[#071A3D]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Usually not refundable"
          title="Situations that do not normally create an automatic refund"
          body="These situations may still be raised for review, but the event itself does not mean that a Red Stone service fee must be returned."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            "A candidate changes their mind after Red Stone has started or completed the paid service.",
            "An employer declines, shortlists another applicant, closes the vacancy or changes its recruitment requirements.",
            "A government authority refuses, delays or changes a visa, work permit, residence or entry decision.",
            "A medical provider issues a medical finding or the candidate does not meet a health requirement.",
            "A regulated occupation requires licensing, qualification recognition or language standards that the candidate does not meet.",
            "The candidate misses deadlines, fails to attend required appointments, does not provide requested documents or withdraws from the process.",
            "The application includes false, altered, inconsistent or misleading information or documents.",
            "A third-party provider has already supplied the service or applies its own non-refundable charge.",
            "Processing takes longer than a general estimate because of an employer, government authority, medical provider or another factor outside Red Stone's control, unless a specific written refund condition applies.",
          ].map((item) => (
            <article key={item} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex gap-3 text-sm leading-7 text-slate-600"><span className="font-black text-[#B8860B]">•</span><p>{item}</p></div>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Payment categories"
          title="How different types of payments are treated"
          body="Always rely on the receipt, invoice, written cost breakdown and programme terms issued for the actual candidate case."
        />
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-[#071A3D] text-white">
                <tr><th className="p-4">Payment type</th><th className="p-4">General treatment</th><th className="p-4">Important note</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr><td className="p-4 font-black text-[#071A3D]">CV & Document Verification Fee</td><td className="p-4">Pays for application review, verification and processing work. Once substantive work starts, a change of mind does not normally make it refundable.</td><td className="p-4">Duplicate, mistaken or undelivered-service cases can still be reviewed.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Recruitment / Programme Fee</td><td className="p-4">Reviewed against the signed agreement, invoice, cost breakdown, work completed and any written refund condition.</td><td className="p-4">A programme-specific written refund clause controls that programme where applicable.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Medical / Health Screening</td><td className="p-4">If paid directly to the medical provider, the provider's refund or rescheduling policy normally applies.</td><td className="p-4">Medical outcomes are determined by qualified providers, not Red Stone.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Government / Visa / Biometrics</td><td className="p-4">Government and visa-centre charges are governed by the relevant authority's rules.</td><td className="p-4">A refusal or withdrawal does not necessarily make government charges refundable.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Police, Translation, Courier or Document Service</td><td className="p-4">Depends on whether the provider has already started or completed the requested service.</td><td className="p-4">Third-party non-refundable costs cannot automatically be recovered from Red Stone.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Flight / Travel / Accommodation</td><td className="p-4">Subject to airline, hotel, agent, employer or booking-provider terms.</td><td className="p-4">Cancellation penalties and fare rules may apply.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </Band>

      <Band>
        <SectionHeading eyebrow="Cancellation" title="How cancellation affects a recruitment case" body="A candidate can ask Red Stone to stop or close an agency-controlled case, but some actions cannot be reversed once another organization has started processing them." />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["1. Request cancellation", "Use the official form and identify the application, service and payment involved."],
            ["2. Red Stone checks the stage", "The agency reviews whether screening, verification, employer submission, third-party booking or another service has already occurred."],
            ["3. External processes are checked", "If money or documents have already gone to a medical provider, authority, airline or other provider, that organization's rules may apply."],
            ["4. Refund decision is separate", "The case can be cancelled even where part or all of the payment is not refundable. Any approved refund is communicated separately."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#071A3D]">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Refund review process"
          title="From request submission to decision"
          body="Red Stone should review the actual transaction and service history rather than deciding from the request form alone."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {[
            ["01", "Request logged", "A successful web request receives an RSEA-RFD reference."],
            ["02", "Payment verified", "Finance records, receipts or transaction references are checked."],
            ["03", "Service stage reviewed", "Red Stone checks work completed and costs already incurred."],
            ["04", "Eligibility decision", "The request is assessed against written terms, provider rules and applicable law."],
            ["05", "Outcome communicated", "The applicant is told whether the request is approved, partially approved, declined or requires more evidence."],
          ].map(([step, title, body]) => (
            <article key={step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#071A3D] text-sm font-black text-[#F2D675]">{step}</span>
              <h2 className="mt-5 text-lg font-black text-[#071A3D]">{title}</h2><p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band id="request-refund">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Before submitting</p>
            <h2 className="mt-3 text-3xl font-black text-[#071A3D]">Have your payment details ready</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">The strongest request includes enough information to match the payment and recruitment case without sending unnecessary sensitive data.</p>
            <ul className="mt-6 grid gap-3 text-sm leading-7 text-slate-600">
              {["Application or case reference", "Receipt, M-Pesa, bank or transaction reference", "Payment date and amount", "What the payment was for", "Whether Red Stone or a third-party provider received it", "What service or recruitment stage had already been completed", "Reason for cancellation or refund request"].map((item) => <li key={item} className="flex gap-3"><span className="font-black text-[#D4AF37]">✓</span><span>{item}</span></li>)}
            </ul>
            <div className="mt-7 rounded-2xl bg-[#071A3D] p-6 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F2D675]">Official support</p>
              <p className="mt-3 text-lg font-black">{CONTACT.emails.support}</p>
              <p className="mt-3 text-sm leading-7 text-slate-200">Use the website form where possible. If the form is unavailable, send the same information through the official support email.</p>
            </div>
          </div>
          <RefundRequestForm />
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading eyebrow="Frequently asked questions" title="Refund and cancellation FAQs" />
        <div className="mx-auto mt-8 max-w-5xl space-y-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:border-[#D4AF37]">
              <summary className="cursor-pointer list-none pr-8 text-base font-black text-[#071A3D]">{faq.question}<span className="float-right text-[#B8860B]">＋</span></summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band>
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">Important policy note</p>
          <h2 className="mt-3 text-3xl font-black text-[#071A3D]">This policy does not remove rights provided by applicable law</h2>
          <p className="mt-4 text-sm leading-8 text-slate-700">
            This page is an operational Red Stone policy and should be read together with the candidate's actual receipt, invoice, written programme terms, service agreement and applicable law. Where mandatory legal rights apply, they take priority. If a refund decision remains disputed after review, the candidate may use the Red Stone complaints procedure and any other lawful external remedy available to them.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/complaints" className="rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Complaints & Escalation</Link>
            <Link href="/contact" className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-[#071A3D]">Contact Red Stone</Link>
          </div>
        </div>
      </Band>
    </main>
  );
}
