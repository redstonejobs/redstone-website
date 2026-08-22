import type { Metadata } from "next";
import { Band, Hero } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { canonical } from "@/lib/public/site";

const faqs = [
  ["Does Red Stone guarantee a job?", "No. Recruitment depends on vacancies, candidate qualifications, employer selection, and relevant legal or immigration approvals."],
  ["Does Red Stone guarantee a visa or work permit?", "No. Those decisions are made by relevant government authorities."],
  ["How do I apply?", "Start by reviewing published jobs and following the job-specific application guidance."],
  ["How do I verify communication?", "Use official Red Stone phone numbers and emails ending in @redstone.co.ke, and contact Red Stone directly if unsure."],
  ["What documents are commonly needed?", "CVs, identity records, certificates, references and employment history may be requested depending on the role."],
  ["Can employers contact Red Stone?", `Yes. Employers can use employers@redstone.co.ke or the employer enquiry form.`],
];

export const metadata: Metadata = { title: "FAQ", description: "Frequently asked questions about Red Stone recruitment.", alternates: { canonical: canonical("/faq") } };

export default function FAQPage() {
  return (
    <>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }} />
      <Hero eyebrow="FAQ" title="Recruitment questions, answered clearly." body="Straightforward guidance for candidates and employers." />
      <Band>
        <div className="mx-auto max-w-4xl space-y-3">
          {faqs.map(([question, answer]) => (
            <details key={question} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
              <summary className="cursor-pointer text-lg font-black text-[#071A3D]">{question}</summary>
              <p className="mt-3 leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </Band>
    </>
  );
}

