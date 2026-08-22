import type { ReactNode } from "react";
import { EmptyState } from "./empty-state";

type AdminTableProps<T> = {
  columns: string[];
  rows: T[];
  emptyTitle: string;
  emptyMessage: string;
  renderRow: (row: T) => ReactNode;
};

export function AdminTable<T>({
  columns,
  rows,
  emptyTitle,
  emptyMessage,
  renderRow,
}: AdminTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{rows.map(renderRow)}</tbody>
        </table>
      </div>
    </div>
  );
}

