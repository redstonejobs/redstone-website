import type { ReactNode } from "react";

import { ConfirmAction } from "@/components/admin/confirm-action";
import { permanentlyDeleteStaffAccount } from "@/lib/admin/staff-account-actions";
import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/utils/supabase/server";

type StaffRecordLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function StaffRecordLayout({
  children,
  params,
}: StaffRecordLayoutProps) {
  const context = await requireAdmin();
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, staff_id, profile_type")
    .eq("id", id)
    .maybeSingle<{
      id: string;
      full_name: string | null;
      staff_id: string | null;
      profile_type: string | null;
    }>();

  const isOwnAccount = context.user.id === id;
  const staffName = profile?.full_name || profile?.staff_id || "this staff member";

  return (
    <>
      {children}

      {profile && !isOwnAccount ? (
        <section className="mt-6 overflow-hidden rounded-xl border-2 border-red-300 bg-white shadow-sm">
          <div className="border-b border-red-200 bg-red-50 px-6 py-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-700">
              Restricted Administrative Action
            </p>
            <h2 className="mt-1 text-xl font-black text-red-950">
              Permanent Staff Deletion
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-red-900/80">
              This permanently removes the staff login, personnel profile, roles,
              active sessions and staff compensation record. Normal operational
              history is preserved or detached where possible. Client records are
              transferred to the administrator performing the deletion.
            </p>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-black text-red-950">
                Use deactivation when you may need the account again.
              </p>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Permanent deletion cannot be undone. The system blocks self-deletion,
                protects the final active Super Administrator, requires Super
                Administrator authority when deleting another administrator, and
                refuses deletion if the staff account also owns candidate application
                or payment records that would otherwise be destroyed.
              </p>
            </div>

            <ConfirmAction
              action={permanentlyDeleteStaffAccount.bind(null, id)}
              label="Permanently Delete Staff"
              message={`Permanently delete ${staffName}? This cannot be undone.`}
              tone="danger"
            >
              <label className="grid gap-2 text-xs font-bold text-red-900">
                Type DELETE to confirm
                <input
                  name="delete_confirmation"
                  required
                  pattern="DELETE"
                  autoComplete="off"
                  className="min-h-10 rounded-md border border-red-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200"
                  placeholder="DELETE"
                />
              </label>
            </ConfirmAction>
          </div>
        </section>
      ) : null}
    </>
  );
}
