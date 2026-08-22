import Link from "next/link";
import { CountryCard } from "@/components/public/country-card";
import { EmptyJobsState, JobCard } from "@/components/public/job-card";
import { Band, ContactCTA, Hero, InfoGrid, ProcessSteps, SectionHeading } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { BLOG_POSTS } from "@/lib/public/blog";
import { COUNTRIES } from "@/lib/public/countries";
import { getFeaturedJobs } from "@/lib/public/jobs";
import { CONTACT, RECRUITMENT_DISCLAIMER, SITE_NAME, SITE_URL } from "@/lib/public/site";

const skilled = ["Healthcare", "Engineering", "Construction Trades", "Hospitality", "Logistics", "Technical Services", "Driving", "Maintenance"];
const unskilled = ["Housekeeping", "Cleaning", "Warehouse Support", "Factory Work", "Farm Work", "Construction Helpers", "Hospitality Support", "General Labour"];
const process = ["Registration", "Profile Review", "Job Matching", "Employer Selection", "Interview", "Documentation", "Visa / Work Permit", "Travel Preparation", "Deployment"];

export default async function HomePage() {
  const { jobs } = await getFeaturedJobs(6);

  return (
    <>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: SITE_URL, email: CONTACT.emails.general, telephone: CONTACT.phones }} />
      <Hero eyebrow="Responsible international recruitment" title="Connecting Talent. Building Futures." body="Red Stone Employment Agency connects qualified candidates with legitimate employment opportunities while helping employers access responsible, professional recruitment support." primary={{ label: "Browse Jobs", href: "/jobs" }} secondary={{ label: "Start Application", href: "/apply" }} />
      <Band><div className="grid gap-4 md:grid-cols-4">{["Ethical Recruitment", "Candidate Support", "Employer Screening", "International Opportunities"].map((item) => <div key={item} className="rounded-md border border-slate-200 bg-white p-5 text-center text-sm font-black text-[#071A3D] shadow-sm">{item}</div>)}</div></Band>
      <Band tone="grey"><SectionHeading eyebrow="Published vacancies" title="Featured Jobs" body="Only published vacancies from the Red Stone system appear here." /><div className="mt-10">{jobs.length ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{jobs.map((job) => <JobCard key={job.id} job={job} />)}</div> : <EmptyJobsState />}</div></Band>
      <Band><div className="grid gap-8 lg:grid-cols-2"><CategoryPanel title="Skilled Jobs" items={skilled} href="/skilled-jobs" /><CategoryPanel title="Unskilled Jobs" items={unskilled} href="/unskilled-jobs" /></div></Band>
      <Band tone="grey"><SectionHeading eyebrow="Destinations" title="Popular Destinations" body="Explore recruitment opportunities and preparation guidance. Work permit and visa decisions are made by relevant authorities." /><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">{COUNTRIES.slice(0, 12).map((country) => <CountryCard key={country.slug} country={country} />)}</div></Band>
      <Band><SectionHeading eyebrow="Process" title="How Recruitment Works" body="A structured process helps candidates and employers stay informed from registration to deployment." /><div className="mt-10"><ProcessSteps steps={process} /></div></Band>
      <Band tone="grey"><SectionHeading eyebrow="Why Red Stone" title="Professional recruitment support" /><div className="mt-10"><InfoGrid items={[
        { title: "Transparent Communication", body: "Clear guidance on applications, employer requirements and official next steps." },
        { title: "Candidate Screening", body: "Structured review of candidate profiles before job matching and employer consideration." },
        { title: "Document Preparation Support", body: "Guidance on common recruitment documents without guaranteeing approval outcomes." },
        { title: "Employer Coordination", body: "Professional support for sourcing, screening, interviews and recruitment administration." },
        { title: "Interview Guidance", body: "Practical preparation to help candidates present their experience responsibly." },
        { title: "Pre-Departure Guidance", body: "Supportive preparation once employer selection and required approvals are complete." },
      ]} /></div></Band>
      <Band><div className="grid gap-8 rounded-md bg-[#071A3D] p-8 text-white md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-[#F2D675]">Employers</p><h2 className="mt-2 text-3xl font-black">Need Reliable Talent?</h2><p className="mt-3 max-w-2xl text-slate-200">Red Stone helps employers source and screen candidates through a responsible recruitment process.</p></div><Link href="/employers" className="rounded-md bg-[#D4AF37] px-5 py-3 text-center text-sm font-black text-[#071A3D]">Recruit With Us</Link></div></Band>
      <Band tone="grey"><div className="grid gap-8 lg:grid-cols-2"><div><SectionHeading eyebrow="Fraud awareness" title="Protect Yourself From Recruitment Fraud" body="Verify official email domains, confirm job details, avoid unofficial payment requests and use official Red Stone channels." /><div className="mt-8 text-center"><Link href="/fraud-awareness" className="rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Learn How to Stay Safe</Link></div></div><div className="rounded-md border border-slate-200 bg-white p-8"><h3 className="text-xl font-black text-[#071A3D]">Verified candidate stories</h3><p className="mt-3 text-slate-600">Verified candidate stories will appear here as candidates and employers authorize their reviews.</p></div></div></Band>
      <Band><SectionHeading eyebrow="Insights" title="Latest Guidance" body="Educational Red Stone editorial content for candidates and employers." /><div className="mt-10 grid gap-5 md:grid-cols-3">{BLOG_POSTS.slice(0, 3).map((post) => <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-md border border-slate-200 p-5 shadow-sm"><p className="text-xs font-black uppercase text-[#B8860B]">{post.category}</p><h3 className="mt-2 text-lg font-black text-[#071A3D]">{post.title}</h3><p className="mt-3 text-sm leading-6 text-slate-600">{post.description}</p></Link>)}</div><p className="mt-10 rounded-md bg-slate-50 p-4 text-sm text-slate-600">{RECRUITMENT_DISCLAIMER}</p></Band>
      <ContactCTA />
    </>
  );
}

function CategoryPanel({ title, items, href }: { title: string; items: string[]; href: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-[#071A3D]">{title}</h2>
      <div className="mt-5 flex flex-wrap gap-2">{items.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{item}</span>)}</div>
      <Link href={href} className="mt-6 inline-block rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Explore</Link>
    </div>
  );
}

