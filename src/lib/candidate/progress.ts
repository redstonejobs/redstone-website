import type { CandidateProfile } from "./types";

export function profileCompletion(profile: CandidateProfile, hasCv: boolean) {
  const fields = [
    ["Full name", profile.full_name],
    ["Phone", profile.phone],
    ["Nationality", profile.nationality],
    ["Date of birth", profile.date_of_birth],
    ["City", profile.city],
    ["Country", profile.country],
    ["CV", hasCv ? "yes" : ""],
  ] as const;
  const complete = fields.filter(([, value]) => Boolean(value)).length;

  return {
    percent: Math.round((complete / fields.length) * 100),
    missing: fields.filter(([, value]) => !value).map(([label]) => label),
  };
}

