import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const context = await requireAdmin();

  return <AdminShell context={context}>{children}</AdminShell>;
}

