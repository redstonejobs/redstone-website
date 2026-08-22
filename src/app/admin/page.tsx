import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

type Profile = {
  full_name: string | null;
  profile_type: string | null;
  is_active: boolean | null;
};

type StaffRole = {
  role: string | null;
  active: boolean | null;
};

const ADMIN_ROLES = new Set(["admin", "super_admin"]);

function redirectWithLog(reason: string, destination: string): never {
  console.log("[admin auth] redirect", {
    reason,
    destination,
  });

  redirect(destination);
}

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[admin auth] authenticated user", {
    id: user?.id ?? null,
    email: user?.email ?? null,
    error: userError?.message ?? null,
  });

  if (!user) {
    redirectWithLog("No authenticated Supabase user", "/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, profile_type, is_active")
    .eq("id", user.id)
    .maybeSingle<Profile>();

  console.log("[admin auth] profile query", {
    error: error?.message ?? null,
    data: profile,
  });

  if (error || !profile) {
    redirectWithLog(
      error ? "Profile query failed" : "No profile row found",
      "/"
    );
  }

  const { data: staffRoles, error: staffRolesError } = await supabase
    .from("staff_roles")
    .select("role, active")
    .eq("user_id", user.id)
    .eq("active", true)
    .returns<StaffRole[]>();

  console.log("[admin auth] staff_roles query", {
    error: staffRolesError?.message ?? null,
    data: staffRoles,
  });

  if (staffRolesError) {
    redirectWithLog("Staff role query failed", "/");
  }

  const profileIsActive = profile.is_active === true;
  const hasProfileAdminRole =
    profileIsActive &&
    profile.profile_type !== null &&
    ADMIN_ROLES.has(profile.profile_type);
  const hasStaffAdminRole =
    staffRoles?.some(
      (staffRole) =>
        staffRole.active === true &&
        staffRole.role !== null &&
        ADMIN_ROLES.has(staffRole.role)
    ) ?? false;

  if (!profileIsActive) {
    redirectWithLog("Profile is not active", "/");
  }

  if (!hasProfileAdminRole) {
    redirectWithLog("Profile type is not admin or super_admin", "/");
  }

  if (!hasStaffAdminRole) {
    redirectWithLog("No active admin or super_admin staff role", "/");
  }

  console.log("[admin auth] access granted", {
    userId: user.id,
    profileType: profile.profile_type,
  });

  return (
    <main className="min-h-screen bg-slate-100">
      <header className="bg-[#071A3D] px-6 py-6 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D4AF37]">
            Red Stone Employment Agency
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Administration Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            Signed in as {user.email}
          </p>

          <p className="mt-1 text-sm text-[#D4AF37]">
            Role: {profile.profile_type}
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard title="Jobs" value="0" />
          <DashboardCard title="Applications" value="0" />
          <DashboardCard title="Candidates" value="0" />
          <DashboardCard title="Employers" value="0" />
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#071A3D]">
            Welcome to Red Stone
          </h2>

          <p className="mt-3 text-slate-600">
            The secure administration system is connected to Supabase and your
            administrator account has been authenticated successfully.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <AdminLink title="Manage Jobs" description="Create and manage vacancies." />
            <AdminLink title="Applications" description="Review candidate applications." />
            <AdminLink title="Candidates" description="Manage candidate records." />
            <AdminLink title="Employers" description="Manage employer accounts." />
            <AdminLink title="Documents" description="Review uploaded documents." />
            <AdminLink title="Staff" description="Manage Red Stone staff access." />
          </div>
        </div>
      </section>
    </main>
  );
}

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-bold text-[#071A3D]">{value}</p>
    </div>
  );
}

function AdminLink({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-5">
      <h3 className="font-bold text-[#071A3D]">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </div>
  );
}
