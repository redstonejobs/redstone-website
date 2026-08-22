import Link from "next/link";
import { CONTACT } from "@/lib/public/site";

export default function CandidateHelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-[#071A3D]">Help</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Application Help", "Review published jobs carefully and only apply through official Red Stone pages."],
          ["Document Guidance", `For document questions, contact ${CONTACT.emails.documents}.`],
          ["Fraud Warning", "Never share your password or send documents to unverified contacts."],
          ["Support", `For portal help, contact ${CONTACT.emails.support}. Jobs enquiries: ${CONTACT.emails.jobs}.`],
        ].map(([title, body]) => <section key={title} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-[#071A3D]">{title}</h2><p className="mt-3 text-slate-600">{body}</p></section>)}
      </div>
      <Link href="/fraud-awareness" className="inline-block rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">Fraud Awareness</Link>
    </div>
  );
}

