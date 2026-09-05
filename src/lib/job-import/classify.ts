import type { ExternalJobCandidate, ImportClassification } from "./types";

const NEGATIVE_AUTHORIZATION_PATTERNS = [
  /must be (?:legally )?(?:eligible|authorized|authorised) to work in canada/i,
  /must (?:already )?have (?:a )?(?:valid )?(?:canadian )?work permit/i,
  /valid work (?:authorization|authorisation) (?:in|for) canada required/i,
  /sponsorship (?:is )?not (?:available|provided|offered)/i,
  /(?:we|employer|company) (?:do|does|will) not sponsor/i,
  /no (?:visa|work permit) sponsorship/i,
];

const POSITIVE_PATTERNS: Array<{
  pattern: RegExp;
  status: ImportClassification["foreignWorkerStatus"];
  sponsorship: boolean;
}> = [
  { pattern: /lmia (?:is )?approved/i, status: "lmia_approved", sponsorship: true },
  { pattern: /approved lmia/i, status: "lmia_approved", sponsorship: true },
  { pattern: /lmia (?:has been )?requested/i, status: "lmia_requested", sponsorship: false },
  { pattern: /(?:visa|work permit) sponsorship (?:is )?(?:available|provided|offered)/i, status: "sponsorship_confirmed", sponsorship: true },
  { pattern: /(?:sponsor|sponsorship).{0,30}(?:foreign worker|work permit|visa)/i, status: "sponsorship_confirmed", sponsorship: true },
  { pattern: /international (?:applicants|candidates) (?:are )?(?:welcome|accepted|encouraged)/i, status: "international_applicants_accepted", sponsorship: false },
  { pattern: /foreign (?:workers|applicants|candidates) (?:are )?(?:welcome|accepted|encouraged)/i, status: "international_applicants_accepted", sponsorship: false },
  { pattern: /temporary foreign worker program/i, status: "verified_foreign_recruitment", sponsorship: true },
];

export function classifyExternalJob(candidate: ExternalJobCandidate): ImportClassification {
  const text = [candidate.title, candidate.descriptionSnippet, candidate.description]
    .filter(Boolean)
    .join("\n");

  for (const pattern of NEGATIVE_AUTHORIZATION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      return {
        foreignWorkerStatus: "requires_existing_authorization",
        immigrationEvidence: compactEvidence(match[0]),
        visaSponsorship: false,
        sponsorshipStatus: "not_included",
        qualityScore: 0,
        reject: true,
        rejectReason: "Source states that existing Canadian work authorization is required or sponsorship is unavailable.",
      };
    }
  }

  let foreignWorkerStatus: ImportClassification["foreignWorkerStatus"] = "unknown";
  let immigrationEvidence: string | null = null;
  let visaSponsorship = false;

  for (const signal of POSITIVE_PATTERNS) {
    const match = text.match(signal.pattern);
    if (match) {
      foreignWorkerStatus = signal.status;
      immigrationEvidence = compactEvidence(match[0]);
      visaSponsorship = signal.sponsorship;
      break;
    }
  }

  let qualityScore = 35;
  if (candidate.companyName) qualityScore += 10;
  if (safeHttpUrl(candidate.sourceUrl)) qualityScore += 10;
  if ((candidate.descriptionSnippet?.length ?? candidate.description?.length ?? 0) >= 100) qualityScore += 10;
  if (candidate.postedAt) qualityScore += 5;
  if (candidate.city) qualityScore += 5;
  if (candidate.salaryMin || candidate.salaryMax) qualityScore += 5;
  if (["A", "A-"].includes(candidate.sourceTrustGrade ?? "")) qualityScore += 5;
  if (foreignWorkerStatus !== "unknown") qualityScore += 20;
  qualityScore = Math.min(100, Math.max(0, qualityScore));

  return {
    foreignWorkerStatus,
    immigrationEvidence,
    visaSponsorship,
    sponsorshipStatus: visaSponsorship ? "included" : "not_confirmed",
    qualityScore,
    reject: false,
    rejectReason: null,
  };
}

export function safeHttpUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function compactEvidence(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 300);
}
