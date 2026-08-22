import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  ADMIN_STAFF_ROLES,
  ROLE_CAPABILITIES,
  ROLE_PRIORITY,
  isAdminProfileType,
  isStaffProfileType,
  isStaffRole,
} from "./constants";
import type { AdminContext, Capability, Profile, StaffRole } from "./types";

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
    isStaffProfileType(profile.profile_type);
  const hasStaffRole = activeRoles.some(
    (staffRole) =>
      staffRole.active === true &&
      staffRole.role !== null &&
      isStaffRole(staffRole.role)
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
    isAdminProfileType(context.profile.profile_type);
  const hasAdminRole = context.staffRoles.some(
    (staffRole) =>
      staffRole.active === true &&
      staffRole.role !== null &&
      (ADMIN_STAFF_ROLES as readonly string[]).includes(staffRole.role)
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
      (ADMIN_STAFF_ROLES as readonly string[]).includes(staffRole.role)
  );
}

export function hasCapability(context: AdminContext, capability: Capability) {
  return context.staffRoles.some((staffRole) => {
    if (staffRole.active !== true || !isStaffRole(staffRole.role)) {
      return false;
    }

    return ROLE_CAPABILITIES[staffRole.role].includes(capability);
  });
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
