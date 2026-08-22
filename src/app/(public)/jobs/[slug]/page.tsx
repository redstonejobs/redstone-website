import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobCard } from "@/components/public/job-card";
import { Band } from "@/components/public/sections";
import { StructuredData } from "@/components/public/structured-data";
import { dateText } from "@/lib/admin/format";
import { formatSalary, getJobBySlug, getPublishedJobs } from "@/lib/public/jobs";
import { canonical, RECRUITMENT_DISCLAIMER, SITE_NAME } from "@/lib/public/site";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { job } = await getJobBySlug(slug);
  if (!job) return { title: "Job Not Found" };
  const title = `${job.title} Jobs in ${job.country ?? "International Markets"}`;
  return {
    title,
    description: `View ${job.title} vacancy details and apply through ${SITE_NAME}.`,
    alternates: { canonical: canonical(`/jobs/${slug}`) },
    openGraph: { title, description: `Published job opportunity from ${SITE_NAME}.` },
  };
}

export default async function JobDetailPage({ params }: Props) {
  const { slug } = await params;
  const { job } = await getJobBySlug(slug);
  if (!job) notFound();
  const related = await getPublishedJobs({ country: job.country ?? undefined, page: "1" });
  const salary = formatSalary(job);

  return (
    <>
      <StructuredData data={{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Jobs", item: canonical("/jobs") },
        { "@type": "ListItem", position: 2, name: job.title, item: canonical(`/jobs/${slug}`) },
      ] }} />
      <Band>
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <article>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8860B]">Published job</p>
            <h1 className="mt-3 text-4xl font-black text-[#071A3D]">{job.title}</h1>
            <p className="mt-3 text-lg text-slate-600">{[job.city, job.country].filter(Boolean).join(", ")}</p>
            <div className="mt-8 grid gap-4 rounded-md border border-slate-200 bg-white p-6 md:grid-cols-2">
              <Detail label="Skill Level" value={job.skill_level} />
              <Detail label="Job Type" value={job.job_type} />
              <Detail label="Vacancies" value={job.vacancies?.toString()} />
              <Detail label="Salary" value={salary} />
              <Detail label="Deadline" value={dateText(job.application_deadline)} />
              <Detail label="Employer" value={job.employer?.company_name} />
            </div>
            <div className="mt-8 prose max-w-none">
              <h2 className="text-2xl font-black text-[#071A3D]">Job Description</h2>
              <p className="whitespace-pre-wrap leading-7 text-slate-700">{job.description || "Detailed job description will be shared through the official recruitment process."}</p>
            </div>
            <p className="mt-8 rounded-md bg-[#F3F4F6] p-4 text-sm text-slate-600">{RECRUITMENT_DISCLAIMER}</p>
          </article>
          <aside className="h-fit rounded-md border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-black text-[#071A3D]">Apply for this job</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Start through the official Red Stone application guidance page. Do not send documents to unofficial contacts.</p>
            <Link href={`/apply/${slug}`} className="mt-5 block rounded-md bg-[#D4AF37] px-5 py-4 text-center text-sm font-black text-[#071A3D]">Apply Now</Link>
          </aside>
        </div>
      </Band>
      <Band tone="grey">
        <h2 className="text-2xl font-black text-[#071A3D]">Related Jobs</h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {related.jobs.filter((item) => item.id !== job.id).slice(0, 3).map((item) => <JobCard key={item.id} job={item} />)}
        </div>
      </Band>
    </>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return <div><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value || "To be confirmed"}</p></div>;
}
