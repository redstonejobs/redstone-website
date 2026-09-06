export type ProfileType = "candidate" | "employer" | "staff" | "admin" | "super_admin";

export type StaffRoleName =
  | "staff"
  | "moderator"
  | "recruiter"
  | "hr"
  | "finance"
  | "admin"
  | "super_admin";

export type Profile = {
  full_name: string | null;
  profile_type: ProfileType | string | null;
  is_active: boolean | null;
};

export type StaffRole = {
  role: StaffRoleName | string | null;
  active: boolean | null;
};

export type AdminContext = {
  user: {
    id: string;
    email?: string;
  };
  profile: Profile;
  staffRoles: StaffRole[];
  highestRole: string;
};

export type Row = Record<string, unknown>;

export type Capability =
  | "jobs.read"
  | "jobs.write"
  | "applications.read"
  | "applications.update"
  | "applications.override"
  | "applications.assign"
  | "candidates.read"
  | "candidates.note"
  | "documents.read"
  | "employers.write"
  | "employers.read"
  | "employers.verify"
  | "documents.verify"
  | "staff.manage"
  | "audit.read"
  | "countries.manage"
  | "fees.manage"
  | "payments.waive";

export type CountMetric = {
  label: string;
  value: number | null;
  href?: string;
  tone?: "navy" | "gold" | "blue" | "green" | "amber" | "red" | "slate";
};
