import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { AdminContext, Capability, Profile, StaffRole, StaffRoleName } from "./types";

const ADMIN_PROFILE_TYPES = new Set(["admin", "super_admin"]);
const STAFF_PROFILE_TYPES = new Set(["staff", "admin", "super_admin"]);
const ADMIN_STAFF_ROLES = new Set(["admin", "super_admin"]);
const STAFF_ROLES = new Set([
  "staff",
  "moderator",
  "recruiter",
  "hr",
  "finance",
  "admin",
  "super_admin",
]);

const ROLE_PRIORITY: StaffRoleName[] = [
  "super_admin",
  "admin",
  "finance",
  "hr",
  "recruiter",
  "moderator",
  "staff",
];

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return {
    supabase,
    user: data.user,
    error,
  };
}

export async function getCurrentProfile(userId: string) {
  const supabase = await createClient();

  return supabase
    .from("profiles")
    .select("full_name, profile_type, is_active")
    .eq("id", userId)
    .maybeSingle<Profile>();
}

export async function getCurrentStaffRoles(userId: string) {
  const supabase = await createClient();

  return supabase
    .from("staff_roles")
    .select("role, active")
    .eq("user_id", userId)
    .eq("active", true)
    .returns<StaffRole[]>();
}

export async function requireAuthenticatedUser() {
  const { user, error } = await getCurrentUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

export async function requireStaff(): Promise<AdminContext> {
  const user = await requireAuthenticatedUser();

  const [{ data: profile, error: profileError }, { data: staffRoles, error: rolesError }] =
    await Promise.all([getCurrentProfile(user.id), getCurrentStaffRoles(user.id)]);

  if (profileError || rolesError || !profile) {
    redirect("/login");
  }

  const activeRoles = staffRoles ?? [];
  const hasStaffProfile =
    profile.is_active === true &&
    profile.profile_type !== null &&
    STAFF_PROFILE_TYPES.has(profile.profile_type);
  const hasStaffRole = activeRoles.some(
    (staffRole) =>
      staffRole.active === true &&
      staffRole.role !== null &&
      STAFF_ROLES.has(staffRole.role)
  );

  if (!hasStaffProfile || !hasStaffRole) {
    redirect("/");
  }

  return {
    user: {
      id: user.id,
      email: user.email ?? undefined,
    },
    profile,
    staffRoles: activeRoles,
    highestRole: getHighestRole(activeRoles),
  };
}

export async function requireAdmin(): Promise<AdminContext> {
  const context = await requireStaff();
  const hasAdminProfile =
    context.profile.profile_type !== null &&
    ADMIN_PROFILE_TYPES.has(context.profile.profile_type);
  const hasAdminRole = context.staffRoles.some(
    (staffRole) =>
      staffRole.active === true &&
      staffRole.role !== null &&
      ADMIN_STAFF_ROLES.has(staffRole.role)
  );

  if (!hasAdminProfile || !hasAdminRole) {
    redirect("/admin");
  }

  return context;
}

export async function requireSuperAdmin(): Promise<AdminContext> {
  const context = await requireAdmin();
  const hasSuperAdminRole = context.staffRoles.some(
    (staffRole) => staffRole.active === true && staffRole.role === "super_admin"
  );

  if (context.profile.profile_type !== "super_admin" || !hasSuperAdminRole) {
    redirect("/admin");
  }

  return context;
}

export function canManageStaff(context: AdminContext) {
  return context.staffRoles.some(
    (staffRole) =>
      staffRole.active === true &&
      staffRole.role !== null &&
      ADMIN_STAFF_ROLES.has(staffRole.role)
  );
}

export function hasCapability(context: AdminContext, capability: Capability) {
  const roles = new Set(context.staffRoles.map((staffRole) => staffRole.role).filter(Boolean));
  const isAdmin = roles.has("admin") || roles.has("super_admin");
  const isSuperAdmin = roles.has("super_admin");

  switch (capability) {
    case "jobs.read":
    case "applications.read":
      return roles.size > 0;
    case "jobs.write":
    case "applications.update":
    case "employers.write":
    case "documents.verify":
      return isAdmin || roles.has("recruiter") || roles.has("hr");
    case "employers.verify":
    case "audit.read":
      return isAdmin;
    case "staff.manage":
      return isAdmin || isSuperAdmin;
    default:
      return false;
  }
}

export function canManageEmployer(context: AdminContext) {
  return hasCapability(context, "employers.write");
}

export function canReviewDocuments(context: AdminContext) {
  return hasCapability(context, "documents.verify");
}

export function canChangeApplicationStatus(context: AdminContext) {
  return hasCapability(context, "applications.update");
}

function getHighestRole(staffRoles: StaffRole[]) {
  for (const role of ROLE_PRIORITY) {
    if (staffRoles.some((staffRole) => staffRole.active === true && staffRole.role === role)) {
      return role;
    }
  }

  return "staff";
}
