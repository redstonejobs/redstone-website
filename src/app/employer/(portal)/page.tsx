import Link from "next/link";
import { requireEmployer } from "@/lib/employer/auth";
import { getEmployerDashboard } from "@/lib/employer/data";
import { dateText, textValue } from "@/lib/admin/format";

export default async function EmployerDashboardPage() {
  const context = await requireEmployer();
  const dashboard = await getEmployerDashboard(context);
  const verification = String(context.employer.verification_status ?? "pending");

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#B8860B]">Company Verification</p>
        <h1 className="mt-2 text-3xl font-black capitalize text-[#071A3D]">{verification.replaceAll("_", " ")}</h1>
        <p className="mt-3 text-slate-600">{message(verification)}</p>
        <p className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">Protect your Red Stone employer account. Never share your password or authentication codes.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Active Jobs" value={dashboard.metrics.activeJobs} />
        <Metric label="Draft Requests" value={dashboard.metrics.draftRequests} />
        <Metric label="Under Review" value={dashboard.metrics.underReview} />
        <Metric label="Applicants" value={dashboard.metrics.applicants} />
        <Metric label="Shortlisted" value={dashboard.metrics.shortlisted} />
        <Metric label="Interviews" value={dashboard.metrics.interviews} />
        <Metric label="Selections" value={dashboard.metrics.selected} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Recent Jobs">
          {dashboard.recentJobs.length ? dashboard.recentJobs.map((job) => <Link key={String(job.id)} href="/employer/jobs" className="block rounded-md border border-slate-200 p-3"><span className="font-bold text-[#071A3D]">{textValue(job, ["title"])}</span><span className="ml-2 text-sm text-slate-500">{textValue(job, ["status"])}</span></Link>) : <Empty text="No approved company jobs yet." />}
        </Panel>
        <Panel title="Recent Applicants">
          {dashboard.recentApplicants.length ? dashboard.recentApplicants.map((application) => <Link key={String(application.id)} href={`/employer/applicants/${application.id}`} className="block rounded-md border border-slate-200 p-3"><span className="font-bold text-[#071A3D]">{textValue(application.job as Record<string, unknown>, ["title"], "Job")}</span><span className="ml-2 text-sm text-slate-500">{dateText(application.submitted_at)}</span></Link>) : <Empty text="Applicants appear after candidates apply to your jobs." />}
        </Panel>
      </div>
      <Panel title="Pending Actions">
        <div className="grid gap-3 md:grid-cols-3">
          <Link href="/employer/profile" className="rounded-md bg-slate-50 p-4 font-bold text-[#071A3D]">Complete company profile</Link>
          <Link href="/employer/jobs/new" className="rounded-md bg-slate-50 p-4 font-bold text-[#071A3D]">Prepare vacancy request</Link>
          <Link href="/employer/support" className="rounded-md bg-slate-50 p-4 font-bold text-[#071A3D]">Contact Red Stone support</Link>
        </div>
      </Panel>
    </div>
  );
}

function message(status: string) {
  if (status === "verified") return "Your company is verified. You may submit vacancy requests and review applicants for your company jobs.";
  if (status === "rejected") return "Your company verification was not approved. Contact Red Stone support for safe next steps.";
  if (status === "suspended") return "Your employer account is suspended. Mutations are disabled while Red Stone reviews the account.";
  return "Your company is still awaiting verification. You may complete your profile and prepare drafts.";
}

function Metric({ label, value }: { label: string; value: number | null }) {
  return <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs font-black uppercase text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-[#071A3D]">{value ?? "Unavailable"}</p></div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-[#071A3D]">{title}</h2><div className="mt-4 space-y-3">{children}</div></section>;
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-slate-500">{text}</p>;
}
