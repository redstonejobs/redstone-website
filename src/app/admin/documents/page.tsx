import Link from "next/link";
import { AdminTable } from "@/components/admin/admin-table";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { rejectDocument, verifyDocument } from "@/lib/admin/actions";
import { fetchDocumentsWithRelations, getPage, getParam } from "@/lib/admin/data";
import { dateText, nestedRow, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DocumentsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const result = await fetchDocumentsWithRelations({
    page: getPage(params),
    query: getParam(params, "q"),
    filters: {
      document_type: getParam(params, "document_type"),
      verification_status: getParam(params, "verification_status"),
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#071A3D]">Documents</h1>
        <p className="mt-1 text-sm text-slate-600">
          Private candidate document metadata. Files remain in the private candidate-documents bucket.
        </p>
      </div>

      <FilterBar
        searchPlaceholder="Search file or document type"
        filters={[
          { name: "document_type", label: "Type", options: ["cv", "passport", "national_id", "certificate", "medical", "other"] },
          { name: "verification_status", label: "Status", options: ["pending", "verified", "rejected"] },
        ]}
      />

      <AdminTable
        columns={["Candidate", "Application", "Type", "Status", "Uploaded", "Reviewed By", "Actions"]}
        rows={result.rows}
        emptyTitle="No documents found"
        emptyMessage="Document metadata will appear here when candidates upload files."
        renderRow={(document: Row) => {
          const application = nestedRow(document, "application");
          const candidate = nestedRow(application, "candidate");
          const reviewer = nestedRow(document, "reviewer");
          const id = textValue(document, ["id"]);

          return (
            <tr key={id}>
              <td className="px-4 py-3 font-medium text-[#071A3D]">
                {textValue(candidate, ["full_name"], textValue(document, ["candidate_id"], "Candidate"))}
              </td>
              <td className="px-4 py-3 text-slate-600">{textValue(document, ["application_id"])}</td>
              <td className="px-4 py-3 text-slate-600">{textValue(document, ["document_type", "type"])}</td>
              <td className="px-4 py-3"><StatusBadge status={textValue(document, ["verification_status", "status"], "pending")} /></td>
              <td className="px-4 py-3 text-slate-600">{dateText(document.created_at)}</td>
              <td className="px-4 py-3 text-slate-600">{textValue(reviewer, ["full_name"], "Not reviewed")}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/documents/${id}/view`} target="_blank" className="font-semibold text-[#071A3D]">View</Link>
                  <ConfirmAction action={verifyDocument.bind(null, id)} label="Verify" message="Verify this document?">
                    <textarea name="verification_note" rows={2} placeholder="Optional note" className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm" />
                  </ConfirmAction>
                  <ConfirmAction action={rejectDocument.bind(null, id)} label="Reject" message="Reject this document?" tone="danger">
                    <textarea name="verification_note" rows={2} placeholder="Rejection note" className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm" />
                  </ConfirmAction>
                </div>
              </td>
            </tr>
          );
        }}
      />

      <Pagination page={result.page} pageSize={result.pageSize} count={result.count} basePath="/admin/documents" />
    </div>
  );
}
