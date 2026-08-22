export type CandidateProfile = {
  full_name: string | null;
  phone: string | null;
  nationality: string | null;
  date_of_birth: string | null;
  city: string | null;
  country: string | null;
  avatar_url?: string | null;
};

export type CandidateContext = {
  user: { id: string; email?: string };
  profile: CandidateProfile;
};

export type CandidateRow = Record<string, unknown>;

