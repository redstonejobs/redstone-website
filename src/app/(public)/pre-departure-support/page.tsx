import type { Metadata } from "next";
import Link from "next/link";

import {
  Band,
  ContactCTA,
  ProcessSteps,
  SectionHeading,
} from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { canonical, SITE_NAME, SITE_URL } from "@/lib/public/site";

export const metadata: Metadata = {
  title: "Pre-Departure Support for International Workers",
  description:
    "Pre-departure support for international workers, including final document checks, employer reporting instructions, travel readiness, airport preparation and deployment guidance from Red Stone Employment Agency.",
  alternates: { canonical: canonical("/pre-departure-support") },
  openGraph: {
    title: "Pre-Departure Support | Red Stone Employment Agency",
    description:
      "Professional pre-departure and deployment preparation for internationally recruited candidates after required employer and government approvals are complete.",
    url: canonical("/pre-departure-support"),
    type: "website",
  },
};

const process = [
  "Confirm Required Approvals",
  "Final Document Review",
  "Employer Reporting Instructions",
  "Travel & Baggage Preparation",
  "Pre-Departure Briefing",
  "Airport & Transit Readiness",
  "Arrival & Employer Reporting",
  "Deployment Follow-Up",
];

const supportAreas = [
  {
    title: "Final Document Readiness",
    body: "We help candidates organize the documents they may need for travel, employer reporting and arrival, including passports, employment records, approval documents and relevant appointment or travel confirmations.",
  },
  {
    title: "Employer Reporting Instructions",
    body: "Candidates receive clear guidance on where and when to report, which employer or representative to contact and what information should be kept available during travel and arrival.",
  },
  {
    title: "Travel Preparation",
    body: "We help candidates prepare practical travel details such as itinerary checks, baggage planning, airport timing, transit awareness and important contact information.",
  },
  {
    title: "Pre-Departure Briefing",
    body: "Candidates are reminded about employment expectations, personal conduct, document security, communication, destination awareness and what to do if travel plans change.",
  },
  {
    title: "Arrival & Deployment Coordination",
    body: "Where applicable, we help candidates understand arrival instructions, employer reporting arrangements and the steps that follow once they reach the destination.",
  },
  {
    title: "Candidate Safety & Record Keeping",
    body: "Candidates are encouraged to keep copies of important documents, receipts, emergency contacts and employer details, and to use official communication channels throughout the journey.",
  },
];

const checklist = [
  "Valid passport",
  "Required visa, work permit or entry authorization where applicable",
  "Employment offer, contract or employer reporting information",
  "Flight itinerary and booking confirmation",
  "Employer, sponsor or authorized representative contact details",
  "Accommodation or arrival address where provided",
  "Medical or compliance records required for travel or reporting",
  "Original certificates or supporting documents only when requested",
  "Emergency contacts and copies of important identification",
  "Required funds, payment cards or destination-specific travel arrangements",
  "Baggage prepared according to the airline rules",
  "Any destination-specific arrival form or official instruction",
];

const safetyPoints = [
  {
    title: "Travel only when your case is ready",
    body: "Candidates should travel only after the required employer and government approvals, entry documents and confirmed travel arrangements are in place for their case.",
  },
  {
    title: "Keep documents in your control",
    body: "Important identity and travel documents should be kept secure and accessible. Do not hand over original documents to unauthorized persons.",
  },
  {
    title: "Verify changes before acting",
    body: "If flight, reporting, accommodation or employer instructions change, confirm the update through the official recruitment, employer, airline or authority channel before acting on it.",
  },
  {
    title: "Know who to contact",
    body: "Keep the employer, Red Stone, airline and relevant emergency contact details available in case you need assistance before departure, during transit or after arrival.",
  },
];

const faq = [
  {
    question: "When does pre-departure support begin?",
    answer:
      "Pre-departure support normally begins after the candidate has reached the appropriate post-selection stage and the required employer, work-permit, visa or other official approvals for travel have been completed or confirmed for the case.",
  },
  {
    question: "Does Red Stone issue airline tickets or immigration approvals?",
    answer:
      "Red Stone may coordinate or provide travel preparation guidance depending on the recruitment arrangement, but airlines issue tickets and government authorities issue visas, work permits and immigration approvals.",
  },
  {
    question: "What documents should I carry when travelling for work?",
    answer:
      "The exact documents depend on the destination and case. Candidates commonly need a valid passport, required entry or work authorization, travel itinerary, employer contact details and any other records specifically requested for their journey or arrival.",
  },
  {
    question: "What should I do if my flight or reporting instructions change?",
    answer:
      "Confirm the change through the official airline, employer, Red Stone or relevant authority channel. Keep written confirmations where possible and do not rely on unverified messages from unknown contacts.",
  },
  {
    question: "Does pre-departure briefing guarantee successful entry at the destination?",
    answer:
      "No. Pre-departure preparation helps candidates organize their travel and reporting, but border, immigration and entry decisions remain with the relevant authorities.",
  },
];

export default function PreDepartureSupportPage() {
  const pageUrl = `${SITE_URL}/pre-departure-support`;

  return (
    <main className="bg-white text-slate-900">
      <StructuredData
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Pre-Departure Support for International Workers",
            serviceType:
              "International recruitment pre-departure and deployment preparation",
            provider: {
              "@type": "Organization",
              name: SITE_NAME,
              url: SITE_URL,
            },
            areaServed: "International",
            url: pageUrl,
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Pre-Departure Support",
                item: pageUrl,
              },
            ],
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faq.map((item) => ({
              "@type": "Question",
              name: item.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          },
        ]}
      />

      <section className="relative overflow-hidden bg-[#071A3D] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1771945029451-da143c6ea0e8?auto=format&fit=crop&fm=jpg&q=82&w=1800)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071A3D] via-[#071A3D]/95 to-[#071A3D]/70" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2D675]">
            Travel & deployment preparation
          </p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Pre-Departure Support for International Workers
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-slate-200 sm:text-lg">
            Red Stone helps selected candidates prepare for the final stage before international deployment with document checks, employer reporting instructions, travel readiness and practical arrival guidance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/immigration-services"
              className="rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] transition hover:bg-[#F2D675]"
            >
              Immigration Guidance
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/15"
            >
              Contact Red Stone
            </Link>
          </div>
        </div>
      </section>

      <Band>
        <SectionHeading
          eyebrow="What we help with"
          title="A clear final stage before deployment"
          body="Pre-departure support is designed for candidates who have reached the appropriate travel stage and need practical guidance before leaving for their employment destination."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {supportAreas.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 h-1.5 w-14 rounded-full bg-[#D4AF37]" />
              <h2 className="text-xl font-black text-[#071A3D]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">
              Pre-departure checklist
            </p>
            <h2 className="mt-2 text-3xl font-black text-[#071A3D]">
              What candidates should confirm before travel
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Every case is different. Candidates should always follow the exact instructions issued for their employer, destination, airline and immigration pathway.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {checklist.map((item) => (
                <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="text-sm font-black text-[#B8860B]">✓</span>
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#071A3D] p-8 text-white shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Before you leave
            </p>
            <h2 className="mt-3 text-3xl font-black">Final checks matter</h2>
            <p className="mt-4 text-sm leading-7 text-slate-200">
              Do not travel for employment based only on informal promises. Confirm that the travel stage is appropriate for your case and that your required documents, employer instructions and travel arrangements are in place.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Verify your passport and travel authorization",
                "Confirm your flight details directly with the airline or official booking source",
                "Keep employer and Red Stone contact details available",
                "Carry only the documents required for your case",
                "Keep copies of important records separately from the originals",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-slate-100"
                >
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/fraud-awareness"
              className="mt-6 inline-flex text-sm font-black text-[#F2D675] hover:underline"
            >
              Read Fraud Awareness Guidance →
            </Link>
          </div>
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Deployment pathway"
          title="From final approval to employer reporting"
          body="A structured pre-departure process helps candidates understand what should happen before travel, during transit and on arrival."
        />
        <div className="mt-10">
          <ProcessSteps steps={process} />
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Safety & responsibility"
          title="Travel prepared and use official channels"
          body="Pre-departure preparation should protect the candidate, preserve accurate records and reduce confusion during the final stages of an international recruitment case."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {safetyPoints.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-black text-[#071A3D]">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Frequently asked questions"
          title="Pre-departure questions"
          body="Answers to common questions candidates ask before international travel and employment deployment."
        />
        <div className="mx-auto mt-10 max-w-4xl space-y-4">
          {faq.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <summary className="cursor-pointer list-none pr-8 text-lg font-black text-[#071A3D]">
                {item.question}
              </summary>
              <p className="mt-4 text-sm leading-7 text-slate-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <div className="rounded-3xl bg-[#071A3D] p-8 text-white sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F2D675]">
              Preparing for deployment?
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Confirm your case stage before making final travel arrangements
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-200">
              Use the instructions issued for your employer and destination, keep your records organized and contact the Red Stone team through official channels if you need clarification.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 lg:mt-0 lg:shrink-0">
            <Link
              href="/immigration-services"
              className="rounded-xl bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]"
            >
              Immigration Services
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-black text-white"
            >
              Contact Red Stone
            </Link>
          </div>
        </div>
      </Band>

      <ContactCTA />
    </main>
  );
}
