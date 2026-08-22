import Link from "next/link";

type PaginationProps = {
  page: number;
  pageSize: number;
  count: number | null;
  basePath: string;
};

export function Pagination({ page, pageSize, count, basePath }: PaginationProps) {
  if (count === null || count <= pageSize) {
    return null;
  }

  const totalPages = Math.ceil(count / pageSize);
  const previous = Math.max(page - 1, 1);
  const next = Math.min(page + 1, totalPages);

  return (
    <nav className="flex items-center justify-between text-sm text-slate-600" aria-label="Pagination">
      <p>
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={`${basePath}?page=${previous}`}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold text-[#071A3D] aria-disabled:pointer-events-none aria-disabled:opacity-50"
          aria-disabled={page === 1}
        >
          Previous
        </Link>
        <Link
          href={`${basePath}?page=${next}`}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 font-semibold text-[#071A3D] aria-disabled:pointer-events-none aria-disabled:opacity-50"
          aria-disabled={page === totalPages}
        >
          Next
        </Link>
      </div>
    </nav>
  );
}

