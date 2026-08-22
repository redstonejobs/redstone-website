import { AdminTable } from "@/components/admin/admin-table";
import { FilterBar } from "@/components/admin/filter-bar";
import { Pagination } from "@/components/admin/pagination";
import { StatusBadge } from "@/components/admin/status-badge";
import { fetchRows, getPage, getParam } from "@/lib/admin/data";
import { dateText, textValue } from "@/lib/admin/format";
import type { Row } from "@/lib/admin/types";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DocumentsPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const result = await fetchRows({
    table: "application_documents",
    page: getPage(params),
    query: getParam(params, "q"),
    searchColumns: ["file_name", "document_type", "type", "verification_status", "status"],
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
        columns={["Candidate", "Application", "Type", "File", "Verification", "Uploaded"]}
        rows={result.rows}
        emptyTitle="No documents found"
        emptyMessage="Document metadata will appear here when candidates upload files."
        renderRow={(document: Row) => (
          <tr key={textValue(document, ["id"])}>
            <td className="px-4 py-3 font-medium text-[#071A3D]">
              {textValue(document, ["candidate_name", "candidate_id"], "Candidate")}
            </td>
            <td className="px-4 py-3 text-slate-600">{textValue(document, ["application_id"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(document, ["document_type", "type"])}</td>
            <td className="px-4 py-3 text-slate-600">{textValue(document, ["file_name"], "Private file")}</td>
            <td className="px-4 py-3"><StatusBadge status={textValue(document, ["verification_status", "status"], "pending")} /></td>
            <td className="px-4 py-3 text-slate-600">{dateText(document.created_at)}</td>
          </tr>
        )}
      />

      <Pagination page={result.page} pageSize={result.pageSize} count={result.count} basePath="/admin/documents" />
    </div>
  );
}

