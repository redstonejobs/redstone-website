"use client";

import { useState } from "react";
import { DOCUMENT_TYPES } from "@/lib/candidate/constants";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  editable: boolean;
};

type Row = { id: number };

const MAX_ROWS = 10;

export default function DocumentUploadBuilder({ action, editable }: Props) {
  const [rows, setRows] = useState<Row[]>([{ id: 1 }]);
  const [nextId, setNextId] = useState(2);

  function addRow() {
    if (rows.length >= MAX_ROWS) return;
    setRows((current) => [...current, { id: nextId }]);
    setNextId((value) => value + 1);
  }

  function removeRow(id: number) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[minmax(190px,0.8fr)_minmax(0,1.8fr)_auto] lg:items-center"
          >
            <label className="grid gap-1 text-sm font-bold text-slate-700">
              <span>Document type</span>
              <select
                name="document_types"
                required
                disabled={!editable}
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 disabled:bg-slate-100"
                defaultValue=""
              >
                <option value="" disabled>
                  Select document type
                </option>
                {DOCUMENT_TYPES.map((documentType) => (
                  <option key={documentType} value={documentType}>
                    {documentType.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-bold text-slate-700">
              <span>Choose file</span>
              <input
                name="files"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                required
                disabled={!editable}
                className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-[#071A3D] file:px-3 file:py-2 file:text-sm file:font-bold file:text-white disabled:bg-slate-100"
              />
            </label>

            <div className="flex items-end gap-2 lg:pt-6">
              <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
              {rows.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeRow(row.id)}
                  disabled={!editable}
                  className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-black text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addRow}
          disabled={!editable || rows.length >= MAX_ROWS}
          className="rounded-xl border border-[#D4AF37] bg-white px-5 py-3 text-sm font-black text-[#071A3D] hover:bg-amber-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
        >
          + Add Another Document
        </button>

        <button
          type="submit"
          disabled={!editable}
          className="rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white hover:bg-[#0b2859] disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Upload Selected Documents
        </button>
      </div>

      <p className="text-xs leading-5 text-slate-500">
        Add one row for each document type. You can upload up to 10 documents per batch. PDF, JPG, PNG and WEBP files are accepted, subject to the server upload limits.
      </p>
    </form>
  );
}
