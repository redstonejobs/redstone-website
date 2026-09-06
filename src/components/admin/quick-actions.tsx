import Link from "next/link";

const actions = [
  { label: "Create Job", href: "/admin/jobs/new" },
  { label: "Create Blog Post", href: "/admin/blog/new" },
  { label: "Manage Blog & SEO", href: "/admin/blog" },
  { label: "SEO Content Strategy", href: "/admin/blog/content-strategy" },
  { label: "Add Employer", href: "/admin/employers" },
  { label: "Review Applications", href: "/admin/applications" },
  { label: "Review Documents", href: "/admin/documents" },
  { label: "Add Staff", href: "/admin/staff" },
];

export function QuickActions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className="rounded-lg border border-[#D4AF37]/40 bg-white px-4 py-3 text-center text-sm font-semibold text-[#071A3D] shadow-sm transition hover:bg-[#FFF8DF]"
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
