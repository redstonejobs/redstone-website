import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/**
 * The admin shell historically exposed /admin/notifications even though the
 * application has no dedicated administrator notification store. Keep the
 * route valid so Next.js link prefetching cannot generate a 404, while routing
 * authorized administrators to the existing audited event register.
 */
export default async function AdminNotificationsPage() {
  await requireAdmin();
  redirect("/admin/audit");
}
