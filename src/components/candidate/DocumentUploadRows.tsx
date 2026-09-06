"use client";

import { useState } from "react";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  documentTypes: string[];
  disabled?: boolean;
};

type UploadRow = { id: number };

function titleCase(input: string) {
  return input
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function DocumentUploadRows({ action, documentTypes, disabled = false }: Props) {
  const [rows, setRows] = useState<UploadRow[]>([{ id: 1 }]);
  const [nextId, setNextId] = useState(2);

  function addRow() {
    if (rows.length >= 10) return;
    setRows((current) => [...current, { id: nextId }]);
    setNextId((current) => current + 1);
  }

  function removeRow(id: number) {
    setRows((current) =>
      current.length <= 1 ? current : current.filter((row) => row.id !== id),
    );
  }

  return (
    <form action={action} className="space-y-4 rounded-2xl bg-slate-50 p-4">
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 lg:grid-cols-[240px_1fr_auto]"
          >
            <select
              name="document_type"
              defaultValue={documentTypes[0] ?? ""}
              required
              disabled={disabled}
              aria-label={`Document type ${index + 1}`}
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-3"
            >
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {titleCase(type)}
                </option>
              ))}
            </select>

            <input
              name="files"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              required
              disabled={disabled}
              aria-label={`Document file ${index + 1}`}
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-2"
            />

            <button
              type="button"
              onClick={() => removeRow(row.id)}
              disabled={disabled || rows.length === 1}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addRow}
          disabled={disabled || rows.length >= 10}
          className="rounded-xl border-2 border-[#D4AF37] bg-white px-5 py-3 text-sm font-black text-[#071A3D] disabled:cursor-not-allowed disabled:opacity-40"
        >
          + Add Another Document
        </button>

        <button
          type="submit"
          disabled={disabled}
          className="rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white disabled:bg-slate-400"
        >
          Upload All Documents
        </button>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Add one row for each document type. You can upload up to 10 documents in one batch.
        Each file will be saved with the document type selected on its row.
      </p>
    </form>
  );
}
