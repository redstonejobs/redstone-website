type JobEligibilityQuery<T> = {
  eq(column: string, value: string | boolean): T;
  not(column: string, operator: string, value: null): T;
  or(filters: string): T;
};

export const EMPLOYER_PUBLIC_SELECT =
  "employer:employers!inner(company_name, verification_status, is_active)";

export const EMPLOYER_FILTER_SELECT = "employer_filter:employers!inner(id)";

export function applyPublishedJobEligibility<T extends JobEligibilityQuery<T>>(
  query: T,
  options: { employerAlias?: string; requireSlug?: boolean } = {}
) {
  const employerAlias = options.employerAlias ?? "employer";
  const requireSlug = options.requireSlug ?? true;

  let scoped = query.eq("status", "published");

  if (requireSlug) {
    scoped = scoped.not("slug", "is", null);
  }

  return scoped
    .or(`application_deadline.is.null,application_deadline.gte.${todayDate()}`)
    .or("vacancies.is.null,vacancies.gt.0")
    .eq(`${employerAlias}.verification_status`, "verified")
    .eq(`${employerAlias}.is_active`, true);
}

export function todayDate() {
  return new Date().toISOString().slice(0, 10);
}
