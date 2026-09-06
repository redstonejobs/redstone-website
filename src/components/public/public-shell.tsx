import Link from "next/link";
import { RedstoneLogo } from "@/components/brand/redstone-logo";
import { FloatingEngagementDock } from "@/components/public/floating-engagement-dock";
import { CONTACT } from "@/lib/public/site";

const nav = [
  ["Home", "/"],
  ["Jobs", "/jobs"],
  ["Countries", "/countries"],
  ["Services", "/services"],
  ["How It Works", "/how-it-works"],
  ["Success Stories", "/success-stories"],
  ["About", "/about"],
  ["Employers", "/employers"],
  ["Blog", "/blog"],
];

export function PublicShell({ children }: { children: React.ReactNode }) {
  const primaryPhone = CONTACT.phones[0] ?? "+254 180 145985";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="bg-[#071A3D] px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-[#F2D675]">
        International Recruitment | Skilled & Unskilled Opportunities | Ethical Candidate Support
      </div>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <RedstoneLogo
            href="/"
            size="md"
            showText
            subtitle="redstone.co.ke"
            priority
            className="text-[#071A3D]"
            textClassName="text-[#071A3D]"
          />
          <nav className="hidden items-center gap-5 text-sm font-semibold text-slate-700 lg:flex">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="transition hover:text-[#B8860B]">
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-bold text-[#071A3D]">Login</Link>
            <Link href="/apply" className="rounded-md bg-[#D4AF37] px-4 py-2 text-sm font-black text-[#071A3D]">Apply Now</Link>
          </div>
          <details className="relative lg:hidden">
            <summary className="list-none rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-[#071A3D]">Menu</summary>
            <div className="absolute right-0 mt-3 grid w-72 gap-1 rounded-md border border-slate-200 bg-white p-3 shadow-xl">
              {nav.map(([label, href]) => (
                <Link key={href} href={href} className="rounded-md px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  {label}
                </Link>
              ))}
              <Link href="/apply" className="rounded-md bg-[#D4AF37] px-3 py-3 text-sm font-black text-[#071A3D]">Apply Now</Link>
              <Link href="/login" className="rounded-md border border-slate-200 px-3 py-3 text-sm font-bold text-[#071A3D]">Login</Link>
            </div>
          </details>
        </div>
      </header>
      <main className="pb-20 lg:pb-0">{children}</main>
      <Footer />
      <FloatingEngagementDock whatsappPhone={primaryPhone} callPhone={primaryPhone} />
    </div>
  );
}

function Footer() {
  const columns = [
    ["Company", [["About", "/about"], ["Mission & Vision", "/mission-vision"], ["Why Red Stone", "/why-red-stone"], ["Our Commitment", "/our-commitment"]]],
    ["Candidates", [["All Jobs", "/jobs"], ["Apply", "/apply"], ["Success Stories", "/success-stories"], ["Candidate Protection", "/candidate-protection"], ["Recruitment Process", "/recruitment-process"], ["FAQ", "/faq"]]],
    ["Employers", [["Employers", "/employers"], ["Employer Services", "/employer-services"], ["Register", "/employer/register"], ["Login", "/login"]]],
    ["Trust & Safety", [["Ethical Recruitment", "/ethical-recruitment"], ["Compliance", "/compliance"], ["Safety", "/safety"], ["Official Channels", "/official-channels"], ["Fraud Awareness", "/fraud-awareness"], ["Complaints", "/complaints"]]],
    ["Legal", [["Privacy", "/privacy"], ["Data Protection", "/data-protection"], ["Account Deletion", "/account-deletion"], ["Terms", "/terms"], ["Payment Terms", "/payment-terms"], ["Refund & Cancellation", "/refund-cancellation"], ["Cookie Policy", "/cookies"], ["Accessibility", "/accessibility"]]],
  ] as const;

  return (
    <footer className="bg-[#071A3D] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.4fr_repeat(5,1fr)]">
        <div>
          <RedstoneLogo
            href="/"
            size="lg"
            showText
            subtitle="redstone.co.ke"
            className="text-[#F2D675]"
            textClassName="text-[#F2D675]"
          />
          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-200">
            Responsible recruitment support for candidates and employers. Only trust communications sent through Red Stone&apos;s official contact channels.
          </p>
          <div className="mt-5 space-y-1 text-sm text-slate-200">
            {CONTACT.phones.map((phone) => <p key={phone}>{phone}</p>)}
            <p><a href={`mailto:${CONTACT.emails.general}`}>{CONTACT.emails.general}</a></p>
            <p><a href={`mailto:${CONTACT.emails.jobs}`}>{CONTACT.emails.jobs}</a></p>
            <p><a href={`mailto:${CONTACT.emails.support}`}>{CONTACT.emails.support}</a></p>
          </div>
        </div>
        {columns.map(([title, links]) => (
          <div key={title}>
            <p className="font-black text-[#F2D675]">{title}</p>
            <div className="mt-4 grid gap-2 text-sm text-slate-200">
              {links.map(([label, href]) => <Link key={href} href={href} className="hover:text-white">{label}</Link>)}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-300">
        © {new Date().getFullYear()} Red Stone Employment Agency. Job and immigration outcomes are not guaranteed.
      </div>
    </footer>
  );
}
