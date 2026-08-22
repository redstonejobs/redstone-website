import type { ReactNode } from "react";
import { EmployerShell } from "@/components/employer/employer-shell";
import { requireEmployer } from "@/lib/employer/auth";

export default async function EmployerPortalLayout({ children }: { children: ReactNode }) {
  const context = await requireEmployer();
  return <EmployerShell context={context}>{children}</EmployerShell>;
}
