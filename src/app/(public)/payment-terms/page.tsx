import type { Metadata } from "next";
import Link from "next/link";

import { Band, ContactCTA, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { canonical, CONTACT, SITE_NAME, SITE_URL } from "@/lib/public/site";

const faqs = [
  {
    question: "What is the KES 2,000 CV and document verification fee for?",
    answer:
      "The KES 2,000 fee covers application-processing work including system processing, CV review, document verification, application record preparation and submission processing. It is not payment for employment, employer sponsorship, visa approval, a work permit or guaranteed placement.",
  },
  {
    question: "Can I pay a Red Stone staff member personally?",
    answer:
      "No. Candidates should not send recruitment payments to a staff member's personal mobile-money wallet, personal bank account or another unofficial destination. Use only the payment method shown inside the Red Stone application system or an official written payment instruction that identifies the service and the authorized recipient.",
  },
  {
    question: "Does paying a fee guarantee that I will get the job?",
    answer:
      "No. Payment for a Red Stone service does not guarantee employer selection, sponsorship, a job offer, medical clearance, professional licensing, a visa, work permit, residence permit or entry approval. Those decisions are made by the responsible employer, provider, regulator or government authority.",
  },
  {
    question: "What should I do if an M-Pesa STK request fails or expires?",
    answer:
      "Do not repeatedly approve multiple payment prompts unless the system clearly shows that the earlier attempt failed. Check your application payment status first. If money was deducted but the website has not confirmed payment, keep the M-Pesa confirmation message and contact Red Stone support before paying again.",
  },
  {
    question: "How are medical, visa and government charges treated?",
    answer:
      "Medical, government, embassy, visa-centre, police, courier, translation, airline and other external charges may be payable directly to the relevant provider. Those charges are separate from Red Stone service fees and are governed by the provider's own rules unless Red Stone has expressly invoiced the amount as part of a written programme arrangement.",
  },
  {
    question: "What happens if I make a duplicate payment?",
    answer:
      "Keep both transaction references and contact Red Stone support. A verified duplicate or mistaken payment can be submitted for review under the Refund & Cancellation Policy. Do not attempt to solve the issue by sending another payment to a different account.",
  },
  {
    question: "Can programme fees or processing amounts change?",
    answer:
      "Yes. A programme cost can depend on the destination, vacancy, documents already held, medical route, government charges, exchange rates and services required. The candidate should rely on the latest written cost breakdown, invoice or payment request issued for the specific application rather than a general estimate shown elsewhere.",
  },
  {
    question: "What proof of payment should I keep?",
    answer:
      "Keep the Red Stone receipt or application payment record together with the M-Pesa, bank or provider transaction reference. For third-party payments, also keep the provider's receipt, booking confirmation or official payment acknowledgement.",
  },
];

export const metadata: Metadata = {
  title: "Payment Terms | Recruitment Fees, M-Pesa & Safe Payments",
  description:
    "Read Red Stone Employment Agency payment terms covering the KES 2,000 CV and document verification fee, M-Pesa payments, programme charges, receipts, third-party costs, duplicate payments and fraud prevention.",
  keywords: [
    "Red Stone payment terms",
    "recruitment payment terms Kenya",
    "recruitment fees Kenya",
    "M-Pesa recruitment payment",
    "CV document verification fee",
    "job application payment Kenya",
    "safe recruitment payments",
    "Red Stone Employment Agency fees",
  ],
  alternates: { canonical: canonical("/payment-terms") },
  openGraph: {
    title: "Payment Terms | Red Stone Employment Agency",
    description:
      "Understand Red Stone recruitment charges, authorized payment methods, M-Pesa processing, receipts, third-party costs and payment-safety rules.",
    url: canonical("/payment-terms"),
    type: "website",
    siteName: SITE_NAME,
  },
};

export default function PaymentTermsPage() {
  const pageUrl = canonical("/payment-terms");

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Red Stone Employment Agency Payment Terms",
            description:
              "Payment terms for Red Stone recruitment services, application verification, programme charges, M-Pesa payments, receipts and third-party costs.",
            url: pageUrl,
            dateModified: "2026-09-06",
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Payment Terms", item: pageUrl },
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
              Fees · payment methods · receipts · payment safety
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">Payment Terms</h1>
            <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
              These terms explain how Red Stone Employment Agency handles recruitment-service payments, application verification charges, programme costs, official payment instructions, M-Pesa processing, receipts, third-party fees, duplicate payments and payment disputes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/apply" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] hover:bg-[#F2D675]">
                Start Application
              </Link>
              <Link href="/refund-cancellation" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white hover:bg-white/15">
                Refund & Cancellation
              </Link>
              <Link href="/official-channels" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white hover:bg-white/15">
                Verify Official Channels
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="Core payment principles"
          title="Know what you are paying for before you approve a payment"
          body="A valid payment request should identify the service or cost, amount, currency, payment destination and the application or candidate record it relates to. Payment for a service is not payment for a guaranteed recruitment or immigration outcome."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Clear purpose", "Every Red Stone payment should relate to an identifiable service, programme cost, document requirement or authorized third-party expense."],
            ["Official destination", "Use the website payment flow or a verified written payment instruction. Do not send recruitment money to personal accounts or unofficial numbers."],
            ["Receipt and reference", "Keep the transaction confirmation and Red Stone or provider receipt because these records are used when reconciling, reviewing or disputing a payment."],
            ["No guaranteed outcome", "A paid service does not guarantee employer selection, sponsorship, medical clearance, licensing, visa approval, work authorization or travel."],
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
        <div className="grid gap-7 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <article className="rounded-3xl bg-[#071A3D] p-8 text-white shadow-xl sm:p-10">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Current application-stage charge</p>
            <h2 className="mt-3 text-4xl font-black">KES 2,000</h2>
            <p className="mt-2 text-lg font-black text-[#F2D675]">CV & Document Verification Fee</p>
            <p className="mt-5 text-sm leading-8 text-slate-200">
              This fee covers system processing, CV review, document verification, application record preparation and submission processing. It is a processing and verification charge, not a payment for a job, employer sponsorship, visa approval or guaranteed placement.
            </p>
            <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-5 text-sm leading-7 text-slate-100">
              The amount and purpose shown on the live application payment screen control the transaction. If a payment screen shows an unexpected amount or purpose, do not approve it until Red Stone support has clarified the request.
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
            <h2 className="text-2xl font-black text-[#071A3D]">What the KES 2,000 fee does not buy</h2>
            <ul className="mt-6 grid gap-3 text-sm leading-7 text-slate-600">
              {[
                "A guaranteed job offer",
                "Guaranteed employer selection or sponsorship",
                "Guaranteed medical clearance",
                "Guaranteed visa, work-permit or residence approval",
                "Guaranteed professional licensing or qualification recognition",
                "Guaranteed flight, accommodation or deployment date",
                "A promise that government processing will finish within a fixed period",
              ].map((item) => (
                <li key={item} className="flex gap-3"><span className="font-black text-[#B8860B]">×</span><span>{item}</span></li>
              ))}
            </ul>
          </article>
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Authorized payment methods"
          title="Use only payment instructions that can be verified"
          body="The available method can differ by service or stage. Candidates should confirm the amount and recipient before authorizing any transaction."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[
            ["M-Pesa STK Push", "Where enabled in the Red Stone application system, an M-Pesa payment request may be sent to the candidate's phone. The candidate should check the merchant/payment prompt, amount and purpose before entering the M-Pesa PIN on their own device."],
            ["Official Red Stone payment instruction", "A finance or application-stage instruction may provide another authorized payment route. The written instruction should identify the service and official recipient. Verify unexpected changes before paying."],
            ["Direct third-party payment", "Some costs may be paid directly to a hospital, medical provider, government authority, visa centre, police service, airline or another provider. Keep that provider's official receipt and booking or transaction reference."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#071A3D]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-5xl rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-red-700">Payment safety rule</p>
          <h2 className="mt-2 text-2xl font-black text-red-950">Never send recruitment money to a staff member's personal account.</h2>
          <p className="mt-3 text-sm leading-7 text-red-900/80">
            Red Stone candidates should not send recruitment fees to personal M-Pesa wallets, personal bank accounts, private cash-collection arrangements or a payment destination supplied through an unverified social-media account. If instructions conflict with the website, invoice or official channel, stop and verify first.
          </p>
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Payment categories"
          title="Different charges belong to different parts of the recruitment journey"
          body="Do not treat every amount connected with an overseas job as a Red Stone fee. Some payments belong to independent providers or government processes."
        />
        <div className="mt-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-[#071A3D] text-white">
                <tr>
                  <th className="p-4">Payment category</th>
                  <th className="p-4">What it may cover</th>
                  <th className="p-4">Who controls the amount / outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr><td className="p-4 font-black text-[#071A3D]">CV & Document Verification</td><td className="p-4">Red Stone application processing, CV review and document verification.</td><td className="p-4">Red Stone sets the service charge; hiring and immigration outcomes remain separate.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Recruitment / Programme Cost</td><td className="p-4">Programme-specific administration, documentation or other defined services shown in the written cost breakdown.</td><td className="p-4">Use the candidate's latest invoice, signed agreement or written programme terms.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Medical / Health Screening</td><td className="p-4">Medical examination, testing or health-clearance procedures.</td><td className="p-4">The authorized medical provider controls the medical assessment and may set or collect the fee.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Visa / Work Permit / Biometrics</td><td className="p-4">Official government or visa-centre application and biometric charges.</td><td className="p-4">The relevant government authority or authorized service provider sets the official charge and decision.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Police / Translation / Courier / Document Service</td><td className="p-4">Supporting documents and independent document-processing services.</td><td className="p-4">The issuing authority or third-party provider may set the price and processing time.</td></tr>
                <tr><td className="p-4 font-black text-[#071A3D]">Travel / Flight / Accommodation</td><td className="p-4">Travel-related costs when they are not covered by the employer.</td><td className="p-4">Airline, hotel, employer, agent or booking-provider terms control the actual charge.</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Before approving a payment"
          title="Five checks every candidate should make"
          body="These checks reduce mistaken payments and make it easier to reconcile a transaction if something goes wrong."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
          {[
            ["01", "Confirm the service", "Know exactly what the charge is for and which application stage it relates to."],
            ["02", "Confirm the amount", "Check the exact amount and currency against the live payment screen, invoice or written cost breakdown."],
            ["03", "Confirm the recipient", "Use the official payment route or verified third-party provider named in the instruction."],
            ["04", "Confirm the reference", "Use the correct application, account or payment reference so the transaction can be matched."],
            ["05", "Keep proof", "Save the M-Pesa message, receipt, invoice and any official provider acknowledgement."],
          ].map(([step, title, body]) => (
            <article key={step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#071A3D] text-xs font-black text-[#F2D675]">{step}</span>
              <h2 className="mt-5 text-lg font-black text-[#071A3D]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="M-Pesa and electronic payment status"
          title="A phone prompt is not the same as a completed payment"
          body="Electronic payment can move through initiated, pending, successful, failed, cancelled or expired states. Candidates should rely on the application payment status and transaction confirmation before trying again."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Initiated", "A payment request has been created or an STK prompt has been sent. No successful payment should be assumed yet."],
            ["Pending", "The system is waiting for the provider result. Avoid making a second payment unless the first attempt has clearly failed or expired."],
            ["Successful", "The provider and Red Stone payment record confirm the transaction. Keep the receipt and reference."],
            ["Failed / cancelled / expired", "The attempt did not complete. Review the displayed reason where available and retry only through the official application flow."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#071A3D]">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-5xl rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-7 text-amber-950">
          <strong>If money was deducted but your application still shows unpaid:</strong> do not immediately pay again. Keep the transaction confirmation and contact {CONTACT.emails.support} so the payment can be checked and reconciled.
        </p>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Programme costs, estimates and changes"
          title="The latest written candidate cost breakdown controls the actual case"
          body="International recruitment costs can change because a candidate already holds some documents, a vacancy has different requirements, a government fee changes, a medical route differs or exchange rates move."
        />
        <div className="mx-auto mt-10 max-w-5xl space-y-4">
          {[
            ["Estimates are not invoices", "General website cost examples are planning guidance. They do not create a fixed charge for every candidate or every vacancy."],
            ["Written programme terms matter", "If a candidate receives a signed agreement, invoice, payment request or written cost breakdown for a specific programme, that document should identify the relevant amounts and conditions for the live case."],
            ["Employer-paid benefits must be confirmed", "Visa costs, air tickets, accommodation, food, insurance or other employer-sponsored benefits apply only where they are confirmed in the individual written offer, employment contract or programme terms."],
            ["Government and provider charges can change", "Embassies, visa centres, medical providers, police authorities, airlines and other providers may change their fees without Red Stone controlling the change."],
            ["Currency conversion", "Where a third-party cost is quoted in another currency, the final amount in Kenya shillings can differ because of exchange rates, payment-provider rates or bank charges."],
          ].map(([title, body]) => (
            <details key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <summary className="cursor-pointer list-none text-lg font-black text-[#071A3D]">{title}</summary>
              <p className="mt-4 text-sm leading-8 text-slate-600">{body}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Receipts, records and disputes"
          title="Keep enough evidence to identify every payment"
          body="Payment records protect both the candidate and the agency by showing the amount, date, recipient, purpose and transaction reference."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-black text-[#071A3D]">Receipts</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Keep Red Stone receipts or application payment confirmations. For M-Pesa, retain the provider transaction message. For direct third-party payments, keep the provider receipt.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-black text-[#071A3D]">Duplicate or missing payment</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">If a payment appears twice, is sent in error or is deducted but not reflected in the system, contact support with the payment reference before making another transaction.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-black text-[#071A3D]">Refund or dispute</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Refund eligibility is governed by the Refund & Cancellation Policy, the service delivered, third-party charges, any case-specific written terms and applicable law.</p>
            <Link href="/refund-cancellation" className="mt-5 inline-flex text-sm font-black text-[#B8860B] hover:underline">Read Refund & Cancellation →</Link>
          </article>
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Fraud prevention"
          title="Red Stone payment requests should never require you to reveal security credentials"
          body="Payment authorization stays with the candidate. Staff should not ask for an M-Pesa PIN, bank PIN, card security code, one-time password or account password."
        />
        <div className="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-2">
          <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-7">
            <h2 className="text-2xl font-black text-emerald-950">Safe actions</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-emerald-900/80">
              {[
                "Read the payment prompt before approving it",
                "Enter your own PIN privately on your own device",
                "Verify unexpected payment instructions",
                "Keep receipts and transaction references",
                "Report suspicious numbers or payment requests",
              ].map((item) => <li key={item} className="flex gap-3"><span className="font-black">✓</span><span>{item}</span></li>)}
            </ul>
          </article>
          <article className="rounded-2xl border border-red-200 bg-red-50 p-7">
            <h2 className="text-2xl font-black text-red-950">Never provide</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-red-900/80">
              {[
                "M-Pesa PIN",
                "Bank or mobile-banking PIN",
                "One-time password or verification code",
                "Card PIN, CVV or full card credentials through chat",
                "Email, portal or social-media account passwords",
              ].map((item) => <li key={item} className="flex gap-3"><span className="font-black">×</span><span>{item}</span></li>)}
            </ul>
          </article>
        </div>
        <div className="mt-8 text-center">
          <Link href="/fraud-awareness" className="inline-flex rounded-xl bg-[#071A3D] px-6 py-3.5 text-sm font-black text-white">Read Fraud Awareness</Link>
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading eyebrow="Frequently asked questions" title="Payment questions candidates commonly ask" />
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
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Relationship with other terms</p>
          <h2 className="mt-2 text-3xl font-black text-[#071A3D]">Payment terms work together with the candidate's written documents and applicable law</h2>
          <p className="mt-4 text-sm leading-8 text-slate-600">
            These website terms provide the general Red Stone payment framework. A specific invoice, signed agreement, written programme terms, employer offer, official government charge or third-party provider term may add case-specific conditions. Where mandatory law gives a person rights that cannot lawfully be excluded, those legal rights take priority.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/terms" className="rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Terms of Use</Link>
            <Link href="/refund-cancellation" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-[#071A3D]">Refund & Cancellation</Link>
            <Link href="/complaints" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black text-[#071A3D]">Complaints</Link>
          </div>
          <p className="mt-6 text-xs leading-6 text-slate-500">Payment questions can be sent through official Red Stone support at {CONTACT.emails.support}.</p>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
