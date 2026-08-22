import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireStaff } from "@/lib/admin/auth";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const context = await requireStaff();

  return <AdminShell context={context}>{children}</AdminShell>;
}

