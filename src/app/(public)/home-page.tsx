import Link from "next/link";
import { CountryCard } from "@/components/public/country-card";
import { EmptyJobsState, JobCard } from "@/components/public/job-card";
import {
  Band,
  ContactCTA,
  Hero,
  InfoGrid,
  ProcessSteps,
  SectionHeading,
} from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { BLOG_POSTS } from "@/lib/public/blog";
import { getConfiguredCountries } from "@/lib/public/countries";
import { getFeaturedJobs } from "@/lib/public/jobs";
import {
  CONTACT,
  RECRUITMENT_DISCLAIMER,
  SITE_NAME,
  SITE_URL,
} from "@/lib/public/site";

const skilled = [
  "Healthcare",
  "Engineering",
  "Construction Trades",
  "Hospitality",
  "Logistics",
  "Technical Services",
  "Driving",
  "Maintenance",
];

const unskilled = [
  "Housekeeping",
  "Cleaning",
  "Warehouse Support",
  "Factory Work",
  "Farm Work",
  "Construction Helpers",
  "Hospitality Support",
  "General Labour",
];

const process = [
  "Registration",
  "Profile Review",
  "Job Matching",
  "Employer Selection",
  "Interview",
  "Documentation",
  "Visa / Work Permit",
  "Travel Preparation",
  "Deployment",
];

const recruitmentImage =
  "https://images.unsplash.com/photo-1758518730327-98070967caab?auto=format&fit=crop&fm=jpg&q=82&w=1600";
const immigrationImage =
  "https://images.unsplash.com/photo-1771945029451-da143c6ea0e8?auto=format&fit=crop&fm=jpg&q=82&w=1600";

const quickLinks = [
  { label: "Candidate Support", href: "/candidate-support" },
  { label: "Medicals & Compliance", href: "/medicals-compliance" },
  { label: "Employer Recruitment Services", href: "/employer-services" },
  { label: "Pre-Departure Support", href: "/pre-departure-support" },
  { label: "Sponsorship Jobs", href: "/sponsorship-jobs" },
  { label: "Visa Process", href: "/visa-process" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Ethical Recruitment", href: "/ethical-recruitment" },
  { label: "International Opportunities", href: "/jobs" },
];

export default async function HomePage() {
  const [{ jobs }, countries] = await Promise.all([
    getFeaturedJobs(6),
    getConfiguredCountries(),
  ]);

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: SITE_NAME,
          url: SITE_URL,
          email: CONTACT.emails.general,
          telephone: CONTACT.phones,
        }}
      />

      <Hero
        eyebrow="Responsible international recruitment"
        title="Connecting Talent. Building Futures."
        body="Red Stone Employment Agency connects qualified candidates with legitimate employment opportunities while helping employers access responsible, professional recruitment support."
        primary={{ label: "Browse Jobs", href: "/jobs" }}
        secondary={{ label: "Start Application", href: "/apply" }}
      />

      <Band>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm font-black text-[#071A3D] shadow-sm transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:shadow-md"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Band>

      <Band tone="grey">
        <div className="overflow-hidden rounded-3xl bg-[#071A3D] p-8 text-white shadow-xl sm:p-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#F2D675]">2026 sponsorship candidate intake</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">24 sponsorship role pathways across 5 destination groups</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-200">
              Explore USA, Canada, New Zealand, Australia and Gulf sponsorship pathways with realistic salary guidance, clear medical requirements, employer-sponsored benefits and a structured Red Stone application process.
            </p>
          </div>
          <Link
            href="/sponsorship-jobs"
            className="mt-6 inline-flex rounded-xl bg-[#D4AF37] px-6 py-3.5 text-sm font-black text-[#071A3D] lg:mt-0 lg:shrink-0"
          >
            View Sponsorship Jobs
          </Link>
        </div>
      </Band>

      <Band>
        <div className="grid gap-7 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B8860B]">Visa process guides</p>
            <h2 className="mt-3 text-3xl font-black text-[#071A3D] sm:text-4xl">
              Detailed visa guidance for all 26 recruitment destinations
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
              Compare work, visitor, student, family, business and residence routes for every Red Stone destination, then verify the latest requirements with each country&apos;s official immigration authority.
            </p>
          </div>
          <Link
            href="/visa-process"
            className="inline-flex rounded-xl bg-[#071A3D] px-6 py-3.5 text-center text-sm font-black text-white transition hover:bg-[#102D5A]"
          >
            Explore 26 Visa Guides
          </Link>
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Recruitment & international mobility"
          title="Support for careers across borders"
          body="Explore international recruitment opportunities and practical preparation for the documentation, medical, compliance, work-permit, visa and travel stages that may follow employer selection."
        />
        <div className="mt-10 grid gap-7 lg:grid-cols-2">
          <VisualServiceCard
            eyebrow="Recruitment"
            title="International Recruitment"
            body="Browse published vacancies, create your candidate profile and move through a structured recruitment process from job matching to employer selection."
            image={recruitmentImage}
            imageAlt="Recruitment professional reviewing an application with a candidate"
            href="/jobs"
            action="Browse Available Jobs"
          />
          <VisualServiceCard
            eyebrow="Immigration preparation"
            title="Work Permit, Visa & Travel Guidance"
            body="After employer selection, candidates can access preparation guidance for required documents, official work-permit or visa steps and pre-departure requirements. Final immigration decisions remain with the relevant authorities."
            image={immigrationImage}
            imageAlt="International airport immigration and baggage reclaim area"
            href="/immigration-services"
            action="Explore Immigration Guidance"
          />
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Choose your path"
          title="Start from where you are today"
          body="Whether you are searching for work, need candidate support, are completing medical and compliance requirements, recruit internationally, are preparing for deployment or need country-specific visa guidance, Red Stone provides a clear place to begin."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-6">
          <PathCard number="01" title="I am looking for a job" body="Search current skilled and entry-level vacancies and begin your application online." href="/jobs" action="Find Jobs" />
          <PathCard number="02" title="I need candidate support" body="Get guidance on CV preparation, application readiness, interviews and recruitment documents." href="/candidate-support" action="Candidate Support" />
          <PathCard number="03" title="I need medical or compliance guidance" body="Understand recruitment medicals, biometrics, police clearance and document-verification requirements." href="/medicals-compliance" action="Medicals & Compliance" />
          <PathCard number="04" title="I am an employer" body="Explore workforce sourcing, candidate screening, interview coordination and international recruitment support." href="/employer-services" action="Employer Recruitment Services" />
          <PathCard number="05" title="I am preparing for departure" body="Complete final document, employer-reporting, travel-readiness and deployment preparation before international travel." href="/pre-departure-support" action="Pre-Departure Support" />
          <PathCard number="06" title="I need visa process guidance" body="Compare work, visitor, student, family, business and residence routes across all 26 Red Stone destinations." href="/visa-process" action="Visa Process Guides" />
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading eyebrow="Published vacancies" title="Featured Jobs" body="Only published vacancies from the Red Stone system appear here." />
        <div className="mt-10">
          {jobs.length ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => <JobCard key={job.id} job={job} />)}
            </div>
          ) : (
            <EmptyJobsState />
          )}
        </div>
      </Band>

      <Band>
        <div className="grid gap-8 lg:grid-cols-2">
          <CategoryPanel title="Skilled Jobs" items={skilled} href="/skilled-jobs" />
          <CategoryPanel title="Entry-Level & General Jobs" items={unskilled} href="/unskilled-jobs" />
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading
          eyebrow="Destinations"
          title="Popular Destinations"
          body="Explore recruitment opportunities and preparation guidance. Work permit and visa decisions are made by relevant authorities."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {countries.slice(0, 12).map((country) => (
            <CountryCard key={country.slug} country={country} />
          ))}
        </div>
      </Band>

      <Band>
        <SectionHeading
          eyebrow="Process"
          title="How Recruitment Works"
          body="A structured process helps candidates and employers stay informed from registration to deployment."
        />
        <div className="mt-10">
          <ProcessSteps steps={process} />
        </div>
      </Band>

      <Band tone="grey">
        <SectionHeading eyebrow="Why Red Stone" title="Professional recruitment support" />
        <div className="mt-10">
          <InfoGrid
            items={[
              { title: "Transparent Communication", body: "Clear guidance on applications, employer requirements and official next steps." },
              { title: "Candidate Screening", body: "Structured review of candidate profiles before job matching and employer consideration." },
              { title: "Document Preparation Support", body: "Guidance on common recruitment documents without guaranteeing approval outcomes." },
              { title: "Employer Coordination", body: "Professional support for sourcing, screening, interviews and recruitment administration." },
              { title: "Interview Guidance", body: "Practical preparation to help candidates present their experience responsibly." },
              { title: "Pre-Departure Guidance", body: "Supportive preparation once employer selection and required approvals are complete." },
            ]}
          />
        </div>
      </Band>

      <Band>
        <div className="grid gap-8 rounded-2xl bg-[#071A3D] p-8 text-white md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#F2D675]">Employers</p>
            <h2 className="mt-2 text-3xl font-black">Need Reliable Talent?</h2>
            <p className="mt-3 max-w-2xl text-slate-200">Red Stone helps employers source, screen and coordinate candidates through a responsible international recruitment process.</p>
          </div>
          <Link href="/employer-services" className="rounded-md bg-[#D4AF37] px-5 py-3 text-center text-sm font-black text-[#071A3D]">Employer Recruitment Services</Link>
        </div>
      </Band>

      <Band tone="grey">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Fraud awareness"
              title="Protect Yourself From Recruitment Fraud"
              body="Verify official email domains, confirm job details, avoid unofficial payment requests and use official Red Stone channels."
            />
            <div className="mt-8 text-center">
              <Link href="/fraud-awareness" className="rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Learn How to Stay Safe</Link>
            </div>
          </div>
          <Link
            href="/success-stories"
            className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:border-[#D4AF37] hover:shadow-md"
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">Client Success Stories</p>
            <h3 className="mt-3 text-2xl font-black text-[#071A3D]">Verified recruitment journeys</h3>
            <p className="mt-4 leading-7 text-slate-600">
              Read client stories only after the recruitment outcome has been checked and the client has authorized publication. No fictional samples are presented as real placements.
            </p>
            <span className="mt-6 inline-flex text-sm font-black text-[#B8860B] group-hover:underline">View Success Stories →</span>
          </Link>
        </div>
      </Band>

      <Band>
        <SectionHeading eyebrow="Insights" title="Latest Guidance" body="Educational Red Stone editorial content for candidates and employers." />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {BLOG_POSTS.slice(0, 3).map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="rounded-xl border border-slate-200 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <p className="text-xs font-black uppercase text-[#B8860B]">{post.category}</p>
              <h3 className="mt-2 text-lg font-black text-[#071A3D]">{post.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{post.description}</p>
            </Link>
          ))}
        </div>
        <p className="mt-10 rounded-md bg-slate-50 p-4 text-sm text-slate-600">{RECRUITMENT_DISCLAIMER}</p>
      </Band>

      <ContactCTA />
    </>
  );
}

function VisualServiceCard({
  eyebrow,
  title,
  body,
  image,
  imageAlt,
  href,
  action,
}: {
  eyebrow: string;
  title: string;
  body: string;
  image: string;
  imageAlt: string;
  href: string;
  action: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div role="img" aria-label={imageAlt} className="h-64 bg-cover bg-center sm:h-72" style={{ backgroundImage: `url(${image})` }} />
      <div className="p-7">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#B8860B]">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black text-[#071A3D]">{title}</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
        <Link href={href} className="mt-6 inline-flex rounded-lg bg-[#071A3D] px-5 py-3 text-sm font-black text-white transition hover:bg-[#102D5A]">{action}</Link>
      </div>
    </article>
  );
}

function PathCard({
  number,
  title,
  body,
  href,
  action,
}: {
  number: string;
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#071A3D] text-sm font-black text-[#F2D675]">{number}</span>
      <h3 className="mt-5 text-xl font-black text-[#071A3D]">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
      <Link href={href} className="mt-5 inline-flex text-sm font-black text-[#B8860B] hover:underline">{action} →</Link>
    </div>
  );
}

function CategoryPanel({ title, items, href }: { title: string; items: string[]; href: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-[#071A3D]">{title}</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">{item}</span>
        ))}
      </div>
      <Link href={href} className="mt-6 inline-block rounded-md bg-[#071A3D] px-5 py-3 text-sm font-black text-white">Explore</Link>
    </div>
  );
}
