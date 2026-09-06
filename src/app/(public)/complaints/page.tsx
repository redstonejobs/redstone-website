import type { Metadata } from "next";
import Link from "next/link";

import { ComplaintForm } from "@/components/public/complaint-form";
import { Band, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { canonical, CONTACT, SITE_NAME, SITE_URL } from "@/lib/public/site";

const complaintTypes = [
  {
    title: "Recruitment or application concerns",
    body: "Concerns about application handling, candidate communication, recruitment stages, job matching, interview coordination or information provided during the recruitment process.",
  },
  {
    title: "Staff conduct or communication",
    body: "Reports about unprofessional conduct, misleading statements, inappropriate communication, harassment, discrimination or treatment that does not meet Red Stone's expected standards.",
  },
  {
    title: "Payments, receipts or fee concerns",
    body: "Questions about a payment request, missing receipt, amount paid, payment destination, fee explanation or a payment that you believe needs review.",
  },
  {
    title: "Fraud, impersonation or suspicious activity",
    body: "Reports about fake recruiters, false Red Stone profiles, suspicious phone numbers, fake job offers, unofficial payment requests, forged documents or other suspected impersonation.",
  },
  {
    title: "Employer or job-offer concerns",
    body: "Concerns about the identity of an employer, job description, employment terms, salary, benefits, accommodation, contract details or differences between a published vacancy and information later received.",
  },
  {
    title: "Medical, documentation or compliance concerns",
    body: "Issues involving medical instructions, biometrics, police clearance, document verification, recruitment documentation or uncertainty about which compliance step applies to a live case.",
  },
  {
    title: "Visa or work-authorization process concerns",
    body: "Complaints about recruitment guidance connected to visa, work-permit or residence preparation. Government decisions themselves must be challenged through the relevant official authority where a review or appeal is available.",
  },
  {
    title: "Privacy, data or account concerns",
    body: "Concerns about personal information, account access, unwanted communication, incorrect personal data or how information was handled. Do not send passwords, PINs or one-time security codes in a complaint.",
  },
];

const process = [
  {
    step: "01",
    title: "Submit the complaint",
    body: "Use the official web form or support email. Provide your contact details, complaint category, application reference if available, a clear description and the outcome you are requesting.",
  },
  {
    step: "02",
    title: "Complaint is logged",
    body: "Web submissions receive a complaint reference. Keep this reference because it helps Red Stone identify the record during later follow-up.",
  },
  {
    step: "03",
    title: "Initial triage",
    body: "The concern is categorized and reviewed for issues such as candidate support, staff conduct, payments, fraud, employer matters, compliance, documentation or privacy.",
  },
  {
    step: "04",
    title: "Evidence review",
    body: "Relevant records may be checked, including application history, messages, receipts, job information or internal case records. You may be asked for specific evidence if it is needed to understand the issue.",
  },
  {
    step: "05",
    title: "Response or corrective action",
    body: "Where the matter can be resolved by Red Stone, the response may include an explanation, record correction, staff follow-up, payment clarification, process correction, referral or another appropriate action.",
  },
  {
    step: "06",
    title: "Escalation where needed",
    body: "If the complaint cannot be resolved at the first review level, it may be escalated internally. Some matters may also need to be referred to an employer, payment provider, medical provider, regulator, law-enforcement body or government authority.",
  },
];

const faqs = [
  {
    question: "Can I complain without an application reference?",
    answer: "Yes. An application or case reference is helpful but is not required. Give enough identifying information for Red Stone to understand the concern, such as your full name, email, phone number, destination, relevant dates and the subject of the complaint.",
  },
  {
    question: "Will making a complaint cancel my application?",
    answer: "Submitting a genuine complaint does not automatically cancel a candidate application. Recruitment and complaint handling are separate processes. However, an application can still change for normal reasons such as employer decisions, eligibility, document issues, vacancy closure or government requirements.",
  },
  {
    question: "Can I report a fake Red Stone recruiter or payment request?",
    answer: "Yes. Choose the fraud or impersonation category and provide the phone number, account name, profile link, payment instructions or other identifying information. Preserve screenshots and payment records. Do not send passwords, PINs or one-time codes.",
  },
  {
    question: "Should I upload my passport or bank statement with the first complaint?",
    answer: "No. The public complaint form is designed for the initial report and does not require document uploads. Keep relevant evidence safely. If evidence is needed, Red Stone should request only the specific information required through an official channel.",
  },
  {
    question: "Can Red Stone reverse a visa refusal through the complaint process?",
    answer: "No. Red Stone can review its own recruitment guidance and case handling, but visa, work-permit, residence and entry decisions are made by the relevant government authority. Any formal review or appeal must follow that authority's rules where such a process exists.",
  },
  {
    question: "What if my complaint involves an employer?",
    answer: "Red Stone can review recruitment records and raise appropriate recruitment concerns with the employer where relevant. Employment-law disputes, workplace safety incidents or matters occurring after deployment may also need to be reported to the employer, labour authority, regulator or other competent body in the destination country.",
  },
  {
    question: "What if I believe a crime or theft has occurred?",
    answer: "Preserve evidence and use the complaint process to alert Red Stone, but do not rely on the company complaint process as a substitute for emergency or law-enforcement reporting. Contact the appropriate police, payment provider, bank or competent authority when the circumstances require it.",
  },
  {
    question: "How should I follow up on a web complaint?",
    answer: `Keep the complaint reference shown after submission. If follow-up is needed, contact ${CONTACT.emails.support} through an official Red Stone channel and include the reference so the complaint can be located more easily.`,
  },
];

export const metadata: Metadata = {
  title: "Complaints Procedure & Fraud Reporting | Red Stone",
  description:
    "Submit a recruitment complaint, payment concern, staff-conduct grievance, fraud report, employer concern or privacy issue to Red Stone Employment Agency through the official complaints process.",
  keywords: [
    "Red Stone complaints",
    "recruitment complaint Kenya",
    "employment agency complaint",
    "report recruitment fraud",
    "job scam report Kenya",
    "candidate grievance procedure",
    "recruitment payment complaint",
    "Red Stone Employment Agency support",
  ],
  alternates: { canonical: canonical("/complaints") },
  openGraph: {
    title: "Complaints Procedure & Fraud Reporting | Red Stone Employment Agency",
    description:
      "Use Red Stone's official complaint procedure for recruitment concerns, suspicious activity, payment issues, staff conduct, employer concerns and candidate grievances.",
    url: canonical("/complaints"),
    type: "website",
    siteName: SITE_NAME,
  },
};

export default function ComplaintsPage() {
  const pageUrl = canonical("/complaints");

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Red Stone Complaints Procedure & Fraud Reporting",
            description:
              "Official Red Stone Employment Agency page for recruitment complaints, candidate grievances, payment concerns, staff conduct complaints and suspicious-activity reporting.",
            url: pageUrl,
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Complaints", item: pageUrl },
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
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">Official complaints & grievance procedure</p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Complaints, Concerns & Fraud Reporting
            </h1>
            <p className="mt-6 max-w-4xl text-base leading-8 text-slate-200 sm:text-lg">
              Red Stone provides an official channel for candidates, placed workers, employers and members of the public to report recruitment concerns, staff conduct, payment issues, suspected fraud, employer concerns, compliance problems and privacy-related complaints.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#submit-complaint" className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] hover:bg-[#F2D675]">
                Submit a Complaint
              </a>
              <Link href="/fraud-awareness" className="rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white hover:bg-white/15">
                Fraud Awareness
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
          eyebrow="What you can report"
          title="A clear complaint channel for recruitment-related concerns"
          body="Choose the category that best describes the issue. A complaint can still be reviewed if it does not fit perfectly into one category."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {complaintTypes.map((item) => (
            <article key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 h-1.5 w-12 rounded-full bg-[#D4AF37]" />
              <h2 className="text-xl font-black text-[#071A3D]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Before you submit"
          title="Information that helps a complaint review"
          body="Clear, factual information makes it easier to identify the relevant case and understand what happened."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-black text-[#071A3D]">Useful information to provide</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-slate-600">
              {[
                "Your full name and reliable contact details",
                "Application or case reference if you have one",
                "Country, job or employer connected to the complaint",
                "The date or approximate period when the issue occurred",
                "Names, phone numbers or account details relevant to suspicious communications",
                "What happened, in chronological order where possible",
                "Any payment amount, receipt or transaction reference involved",
                "What you have already done to try to resolve the issue",
                "The outcome or action you are requesting",
              ].map((item) => <li key={item} className="flex gap-3"><span className="font-black text-[#B8860B]">✓</span><span>{item}</span></li>)}
            </ul>
          </article>

          <article className="rounded-2xl border border-red-100 bg-red-50 p-7 shadow-sm">
            <h2 className="text-2xl font-black text-red-950">Do not include these in the first report</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-7 text-red-900/80">
              {[
                "Passwords or account login credentials",
                "Mobile-money, bank or card PINs",
                "One-time passwords or verification codes",
                "Full bank-card numbers or security codes",
                "Unnecessary medical records",
                "Unnecessary passport or national-ID scans",
                "Private information belonging to another person unless it is necessary and lawful to share",
              ].map((item) => <li key={item} className="flex gap-3"><span className="font-black">×</span><span>{item}</span></li>)}
            </ul>
            <p className="mt-5 rounded-xl bg-white/70 p-4 text-xs leading-6 text-red-950">
              Keep evidence safely. If documents are needed, provide them only after a specific request through a verified Red Stone channel or another competent authority.
            </p>
          </article>
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Complaint-handling process"
          title="How a complaint moves from submission to review"
          body="The exact handling path depends on the issue, available evidence and whether another organization or authority is responsible for part of the matter."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {process.map((item) => (
            <article key={item.step} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#071A3D] text-sm font-black text-[#F2D675]">{item.step}</span>
              <h2 className="mt-5 text-xl font-black text-[#071A3D]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl bg-[#071A3D] p-7 text-white shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F2D675]">Official complaint email</p>
            <h2 className="mt-3 text-2xl font-black">{CONTACT.emails.support}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200">Use the website form where possible because it creates a structured complaint record and reference. Email remains an official alternative if the form is unavailable.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Fair review</p>
            <h2 className="mt-3 text-2xl font-black text-[#071A3D]">Facts and records matter</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">Complaints should be assessed using the available records and relevant evidence. Red Stone may need information from staff, employers or service providers to understand a disputed event.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#B8860B]">Privacy</p>
            <h2 className="mt-3 text-2xl font-black text-[#071A3D]">Share only what is necessary</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">Complaint information should be handled for review and resolution purposes. Information may need to be shared where necessary to investigate the matter, comply with law or refer the issue to an appropriate organization or authority.</p>
          </article>
        </div>
      </Band>

      <section id="submit-complaint" className="scroll-mt-28 bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="Submit online"
            title="Official Red Stone complaint form"
            body="After a successful submission, the form provides a Red Stone complaint reference. Keep that reference for follow-up."
          />
          <div className="mt-10">
            <ComplaintForm />
          </div>
        </div>
      </section>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Escalation & urgent matters"
          title="Some issues require action outside the company complaint process"
          body="Red Stone's complaint process can review the agency's own recruitment activities, but it does not replace emergency services, regulators, courts, payment providers or government appeal processes."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Immediate safety risk", "Contact the appropriate local emergency service or law-enforcement authority where there is an immediate threat to safety."],
            ["Suspected theft or payment fraud", "Preserve the transaction evidence and promptly contact the relevant bank, mobile-money provider or payment institution in addition to reporting the matter."],
            ["Government immigration decision", "Use the official review, reconsideration or appeal process of the relevant immigration authority where one is available."],
            ["Workplace or employer dispute", "Depending on the issue and destination, the employer, labour authority, regulator, union, court or another competent body may have jurisdiction."],
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
          eyebrow="Frequently asked questions"
          title="Complaints and grievance FAQs"
          body="These answers explain how to use Red Stone's complaint channel and when another authority may also need to be contacted."
        />
        <div className="mt-8 grid gap-4">
          {faqs.map((faq) => (
            <details key={faq.question} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm open:border-[#D4AF37]">
              <summary className="cursor-pointer list-none pr-8 text-base font-black text-[#071A3D]">
                {faq.question}<span className="float-right text-[#B8860B]">＋</span>
              </summary>
              <p className="mt-4 max-w-5xl text-sm leading-7 text-slate-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band tone="navy">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">Need another official resource?</p>
            <h2 className="mt-3 text-3xl font-black text-white">Verify channels before sharing information or making a payment.</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">Use Red Stone's fraud-awareness and official-channel pages to check suspicious recruitment communications before taking action.</p>
          </div>
          <div className="flex flex-wrap gap-3 lg:justify-end">
            <Link href="/fraud-awareness" className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">Fraud Awareness</Link>
            <Link href="/official-channels" className="rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white">Official Channels</Link>
          </div>
        </div>
      </Band>
    </main>
  );
}
