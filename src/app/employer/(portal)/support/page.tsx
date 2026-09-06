import { CONTACT } from "@/lib/public/site";

export default function EmployerSupportPage() {
  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-black text-[#071A3D]">Employer Support</h1><p className="mt-2 text-slate-600">Use official Red Stone channels for company verification, vacancy support and interview coordination.</p></div>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Verification Help", "Questions about company verification, required documents or Red Stone review."],
          ["Vacancy Help", "Support preparing or updating vacancy requests before Red Stone review."],
          ["Applicant Review Help", "Guidance on reviewing candidate profiles and recording structured decisions."],
          ["Interview Coordination", "Coordinate interview requests, reschedules and candidate instructions."],
        ].map(([title, body]) => <section key={title} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm"><h2 className="font-black text-[#071A3D]">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></section>)}
      </div>
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-black text-[#071A3D]">Official Contacts</h2>
        <p className="mt-3 text-slate-700">Employer enquiries: <a className="font-bold text-[#B8860B]" href={`mailto:${CONTACT.emails.jobs}`}>{CONTACT.emails.jobs}</a></p>
        <p className="mt-2 text-slate-700">Support: <a className="font-bold text-[#B8860B]" href={`mailto:${CONTACT.emails.support}`}>{CONTACT.emails.support}</a></p>
      </section>
    </div>
  );
}
