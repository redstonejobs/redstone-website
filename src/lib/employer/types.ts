import type { Row } from "@/lib/admin/types";

export type EmployerContext = {
  user: {
    id: string;
    email?: string;
  };
  profile: Row;
  employer: Row;
  verified: boolean;
  active: boolean;
};

export type EmployerActionResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };
