import type { AdminContext } from "./types";
import { hasCapability } from "./auth";
import { APPLICATION_STATUSES, JOB_STATUSES } from "./status";

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type JobStatus = (typeof JOB_STATUSES)[number];

const APPLICATION_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ["submitted", "withdrawn"],
  submitted: ["under_review", "withdrawn", "rejected"],
  under_review: ["shortlisted", "rejected", "withdrawn"],
  shortlisted: ["interview", "employer_review", "rejected", "withdrawn"],
  interview: ["employer_review", "offer_pending", "rejected", "withdrawn"],
  employer_review: ["offer_pending", "rejected", "withdrawn"],
  offer_pending: ["offer_issued", "rejected", "withdrawn"],
  offer_issued: ["documentation", "rejected", "withdrawn"],
  documentation: ["visa_processing", "rejected", "withdrawn"],
  visa_processing: ["approved", "rejected", "withdrawn"],
  approved: ["deployed", "withdrawn"],
  deployed: [],
  rejected: [],
  withdrawn: [],
};

const EMPLOYER_TRANSITIONS: Record<string, string[]> = {
  pending: ["verified", "rejected"],
  verified: ["rejected", "pending"],
  rejected: ["pending", "verified"],
};

export function isApplicationStatus(status: string): status is ApplicationStatus {
  return APPLICATION_STATUSES.includes(status as ApplicationStatus);
}

export function isJobStatus(status: string): status is JobStatus {
  return JOB_STATUSES.includes(status as JobStatus);
}

export function getAllowedNextApplicationStatuses(status: string | null | undefined) {
  if (!status || !isApplicationStatus(status)) {
    return ["submitted"] as ApplicationStatus[];
  }

  return APPLICATION_TRANSITIONS[status];
}

export function canTransitionApplicationStatus(from: string | null | undefined, to: string) {
  if (!isApplicationStatus(to)) {
    return false;
  }

  if (!from || from === to) {
    return true;
  }

  if (!isApplicationStatus(from)) {
    return false;
  }

  return APPLICATION_TRANSITIONS[from].includes(to);
}

export function canOverrideApplicationTransition(context: AdminContext, reason: string) {
  return hasCapability(context, "applications.override") && reason.trim().length >= 10;
}

export function canTransitionEmployerVerification(from: string | null | undefined, to: string) {
  if (!from || from === to) {
    return true;
  }

  return (EMPLOYER_TRANSITIONS[from] ?? []).includes(to);
}

