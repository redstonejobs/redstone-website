import type { Capability, ProfileType, StaffRoleName } from "./types";

export const ADMIN_PROFILE_TYPES = ["admin", "super_admin"] as const;
export const STAFF_PROFILE_TYPES = ["staff", "admin", "super_admin"] as const;
export const ADMIN_STAFF_ROLES = ["admin", "super_admin"] as const;
export const STAFF_ROLES = [
  "staff",
  "moderator",
  "recruiter",
  "hr",
  "finance",
  "admin",
  "super_admin",
] as const satisfies StaffRoleName[];

export const ROLE_PRIORITY = [
  "super_admin",
  "admin",
  "finance",
  "hr",
  "recruiter",
  "moderator",
  "staff",
] as const satisfies StaffRoleName[];

export const ROLE_CAPABILITIES: Record<StaffRoleName, Capability[]> = {
  staff: ["applications.read", "documents.read", "candidates.read"],
  moderator: ["applications.read", "documents.read", "candidates.read", "audit.read"],
  recruiter: [
    "jobs.read",
    "applications.read",
    "applications.update",
    "applications.assign",
    "documents.read",
    "documents.verify",
    "candidates.read",
    "candidates.note",
  ],
  hr: [
    "jobs.read",
    "jobs.write",
    "applications.read",
    "applications.update",
    "applications.assign",
    "documents.read",
    "documents.verify",
    "candidates.read",
    "candidates.note",
    "employers.read",
  ],
  finance: ["applications.read", "documents.read", "employers.read", "audit.read"],
  admin: [
    "jobs.read",
    "jobs.write",
    "applications.read",
    "applications.update",
    "applications.assign",
    "documents.read",
    "documents.verify",
    "candidates.read",
    "candidates.note",
    "employers.read",
    "employers.write",
    "employers.verify",
    "staff.manage",
    "audit.read",
    "countries.manage",
    "fees.manage",
  ],
  super_admin: [
    "jobs.read",
    "jobs.write",
    "applications.read",
    "applications.update",
    "applications.override",
    "applications.assign",
    "documents.read",
    "documents.verify",
    "candidates.read",
    "candidates.note",
    "employers.read",
    "employers.write",
    "employers.verify",
    "staff.manage",
    "audit.read",
    "countries.manage",
    "fees.manage",
  ],
};

export function isStaffRole(role: string | null | undefined): role is StaffRoleName {
  return (STAFF_ROLES as readonly string[]).includes(role ?? "");
}

export function isStaffProfileType(type: string | null | undefined): type is ProfileType {
  return (STAFF_PROFILE_TYPES as readonly string[]).includes(type ?? "");
}

export function isAdminProfileType(type: string | null | undefined): type is ProfileType {
  return (ADMIN_PROFILE_TYPES as readonly string[]).includes(type ?? "");
}
