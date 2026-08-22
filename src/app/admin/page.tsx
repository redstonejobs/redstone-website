import Link from "next/link";
import { AdminTable } from "@/components/admin/admin-table";
import { EmptyState } from "@/components/admin/empty-state";
import { ErrorState } from "@/components/admin/error-state";
import { MetricCard } from "@/components/admin/metric-card";
import { QuickActions } from "@/components/admin/quick-actions";
import { AdminSection } from "@/components/admin/section";
import { StatusBadge } from "@/components/admin/status-badge";
import { getDashboardData } from "@/lib/admin/data";
import { dateText, numberValue, textValue } from "@/lib/admin/format";
import { labelForStatus } from "@/lib/admin/status";
import type { Row } from "@/lib/admin/types";

export default async function AdminPage() {
  const dashboard = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#B8860B]">Operations</p>
        <h1 className="text-3xl font-bold text-[#071A3D]">Administration Dashboard</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Live recruitment metrics and queues from the Red Stone Supabase database.
        </p>
      </div>

      {dashboard.errors.length > 0 ? (
        <ErrorState message="Some dashboard sections could not be loaded. Counts marked unavailable are not fabricated." />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <AdminSection title="Admin Quick Actions">
        <QuickActions />
      </AdminSection>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminSection title="Recent Applications" description="Latest candidate submissions and case activity.">
          <AdminTable
            columns={["Candidate", "Job", "Destination", "Status", "Submitted"]}
            rows={dashboard.recentApplications}
            emptyTitle="No recent applications"
            emptyMessage="Applications will appear here when candidates submit them."
            renderRow={(application: Row) => {
              return (
                <tr key={textValue(application, ["id"])}>
                  <td className="px-4 py-3 font-medium text-[#071A3D]">
                    {textValue(application, ["candidate_name", "candidate_id"], "Candidate")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {textValue(application, ["job_title", "job_id"], "Job not set")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {textValue(application, ["country", "destination", "city"], "Destination not set")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={textValue(application, ["status"], "draft")} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {dateText(application.submitted_at ?? application.created_at)}
                  </td>
                </tr>
              );
            }}
          />
        </AdminSection>

        <AdminSection title="Recruitment Pipeline" description="Current application counts by status.">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-3">
              {dashboard.pipeline.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-600">{labelForStatus(item.status)}</span>
                  <span className="font-semibold text-[#071A3D]">
                    {item.count === null ? "Unavailable" : item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AdminSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSection
          title="Latest Jobs"
          description="Newest vacancies by creation date."
          action={<Link href="/admin/jobs" className="text-sm font-semibold text-[#071A3D]">View all</Link>}
        >
          <AdminTable
            columns={["Title", "Country", "Employer", "Vacancies", "Status", "Deadline"]}
            rows={dashboard.latestJobs}
            emptyTitle="No jobs found"
            emptyMessage="Create a job when a real vacancy is ready to manage."
            renderRow={(job: Row) => (
              <tr key={textValue(job, ["id"])}>
                <td className="px-4 py-3 font-medium text-[#071A3D]">{textValue(job, ["title"])}</td>
                <td className="px-4 py-3 text-slate-600">{textValue(job, ["country"])}</td>
                <td className="px-4 py-3 text-slate-600">
                  {textValue(job, ["employer_name", "employer_id"], "Employer not set")}
                </td>
                <td className="px-4 py-3 text-slate-600">{numberValue(job, ["number_of_vacancies", "vacancies"])}</td>
                <td className="px-4 py-3"><StatusBadge status={textValue(job, ["status"], "draft")} /></td>
                <td className="px-4 py-3 text-slate-600">{dateText(job.deadline)}</td>
              </tr>
            )}
          />
        </AdminSection>

        <AdminSection title="Document Verification Queue">
          {dashboard.documentQueue.length === 0 ? (
            <EmptyState title="No pending documents" message="Pending private document checks will appear here." />
          ) : (
            <AdminTable
              columns={["Candidate", "Type", "Status", "Uploaded"]}
              rows={dashboard.documentQueue}
              emptyTitle="No pending documents"
              emptyMessage="Pending private document checks will appear here."
              renderRow={(document: Row) => (
                <tr key={textValue(document, ["id"])}>
                  <td className="px-4 py-3 font-medium text-[#071A3D]">
                    {textValue(document, ["candidate_name", "candidate_id"], "Candidate")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{textValue(document, ["document_type", "type"])}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={textValue(document, ["verification_status", "status"], "pending")} />
                  </td>
                  <td className="px-4 py-3 text-slate-600">{dateText(document.created_at)}</td>
                </tr>
              )}
            />
          )}
        </AdminSection>
      </div>

      <AdminSection title="Employer Verification Queue">
        <AdminTable
          columns={["Company", "Country", "Status", "Created"]}
          rows={dashboard.employerQueue}
          emptyTitle="No employers awaiting review"
          emptyMessage="Employer records will appear here when they are created."
          renderRow={(employer: Row) => (
            <tr key={textValue(employer, ["id"])}>
              <td className="px-4 py-3 font-medium text-[#071A3D]">
                {textValue(employer, ["company_name", "name"])}
              </td>
              <td className="px-4 py-3 text-slate-600">{textValue(employer, ["country"])}</td>
              <td className="px-4 py-3">
                <StatusBadge status={textValue(employer, ["verification_status", "status"], "pending")} />
              </td>
              <td className="px-4 py-3 text-slate-600">{dateText(employer.created_at)}</td>
            </tr>
          )}
        />
      </AdminSection>
    </div>
  );
}
