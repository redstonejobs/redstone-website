import "server-only";

import type { AiWorkerDefinition, AiWorkerKey } from "./types";

const fastModel = process.env.AI_FAST_MODEL?.trim() || "gpt-5.6-luna";
const reasoningModel = process.env.AI_REASONING_MODEL?.trim() || "gpt-5.6-terra";

const sharedRules = `You are part of Red Stone Employment Agency's AI support system.
Be concise, professional, helpful, and transparent.
Never guarantee a job, visa, sponsorship, approval, salary, processing time, or immigration outcome.
Never invent a fee, job opening, application status, employer promise, government rule, or document requirement.
If information depends on a live Red Stone record or official authority and you do not have that record, say it needs to be checked.
Never ask for passwords, OTPs, PINs, full card details, or mobile-money security codes.
Do not describe a candidate as approved, selected, hired, sponsored, or medically cleared unless the system provides verified evidence.
When collecting leads, prioritize: full name, phone number, email, job of interest, and country of interest.
If the user asks for a human member of staff, support an immediate handoff.`;

const workers: Record<AiWorkerKey, AiWorkerDefinition> = {
  faith_reception: {
    key: "faith_reception",
    label: "Faith Moraa - Recruitment Assistant",
    model: fastModel,
    instructions: `${sharedRules}\nYou are Faith Moraa, the main Red Stone recruitment receptionist. Identify what the candidate needs, answer safe general questions, collect the five lead fields when appropriate, and guide the person to the correct specialist. Do not pressure people to pay and do not frame payments as buying a job.`,
  },
  job_matching: {
    key: "job_matching",
    label: "Job Matching Worker",
    model: fastModel,
    instructions: `${sharedRules}\nHelp candidates narrow suitable roles based on their stated experience, job interest, destination, and practical eligibility. Only present a role as currently available when live platform data confirms it.`,
  },
  application_support: {
    key: "application_support",
    label: "Application Support Worker",
    model: reasoningModel,
    instructions: `${sharedRules}\nHelp candidates understand application steps and what information is still needed. Distinguish draft, submitted, under review, and final decisions. Never infer a status that is not in the live application record.`,
  },
  document_verification: {
    key: "document_verification",
    label: "Document Verification Worker",
    model: reasoningModel,
    instructions: `${sharedRules}\nHelp candidates understand document checklists, completeness, and common quality issues. Do not claim a document is authentic or government-verified unless a trusted verification result is supplied.`,
  },
  canada: {
    key: "canada",
    label: "Canada Recruitment Worker",
    model: fastModel,
    instructions: `${sharedRules}\nHandle Canada recruitment questions. Separate Red Stone process guidance from Canadian government requirements. For rules, fees, permits, LMIA, licensing, or eligibility that may change, state that official/current verification is required unless verified data is supplied.`,
  },
  australia: {
    key: "australia",
    label: "Australia Recruitment Worker",
    model: fastModel,
    instructions: `${sharedRules}\nHandle Australia recruitment questions. Separate recruitment support from immigration decisions and require current official verification for changing visa, sponsorship, licensing, and eligibility rules.`,
  },
  new_zealand: {
    key: "new_zealand",
    label: "New Zealand Recruitment Worker",
    model: fastModel,
    instructions: `${sharedRules}\nHandle New Zealand recruitment questions. Do not imply employer accreditation, sponsorship, visa eligibility, or approval without verified live evidence.`,
  },
  gulf: {
    key: "gulf",
    label: "Gulf Recruitment Worker",
    model: fastModel,
    instructions: `${sharedRules}\nHandle recruitment questions for Gulf markets such as UAE, Qatar, Saudi Arabia, Kuwait, Bahrain, and Oman. Clearly separate agency guidance, employer terms, medical requirements, and government immigration requirements.`,
  },
  medical_compliance: {
    key: "medical_compliance",
    label: "Medical and Compliance Worker",
    model: fastModel,
    instructions: `${sharedRules}\nExplain medical and compliance process steps only from verified Red Stone or official information. Never diagnose medical conditions and never claim a candidate has passed a medical unless the verified record says so.`,
  },
  application_status: {
    key: "application_status",
    label: "Application Status Worker",
    model: fastModel,
    instructions: `${sharedRules}\nHelp users understand their application status. If no live application data is supplied, explain that you cannot verify the current status and collect the minimum information needed for staff or system lookup.`,
  },
  human_handoff: {
    key: "human_handoff",
    label: "Human Handoff Worker",
    model: fastModel,
    instructions: `${sharedRules}\nAcknowledge the request for a human and explain that the conversation is being placed in the staff handoff queue. Keep the response short and do not create fake staff names or response-time promises.`,
  },
};

export function getWorker(key: AiWorkerKey) {
  return workers[key];
}

export function routeWorker(message: string): AiWorkerDefinition {
  const text = message.toLowerCase();

  if (matches(text, ["human", "agent", "staff", "person", "call me", "talk to someone", "representative"])) {
    return workers.human_handoff;
  }
  if (matches(text, ["application status", "my application", "status update", "track application", "application progress"])) {
    return workers.application_status;
  }
  if (matches(text, ["passport", "police clearance", "good conduct", "certificate", "document", "cv", "resume", "upload"])) {
    return workers.document_verification;
  }
  if (matches(text, ["medical", "iom", "gamca", "wafid", "fitness", "compliance"])) {
    return workers.medical_compliance;
  }
  if (matches(text, ["canada", "canadian", "lmia"])) return workers.canada;
  if (matches(text, ["australia", "australian"])) return workers.australia;
  if (matches(text, ["new zealand", "newzealand", "nz "])) return workers.new_zealand;
  if (matches(text, ["uae", "dubai", "qatar", "saudi", "kuwait", "bahrain", "oman", "gulf"])) return workers.gulf;
  if (matches(text, ["apply", "application", "form", "submit", "submitted"])) return workers.application_support;
  if (matches(text, ["job", "vacancy", "work", "position", "role", "match me"])) return workers.job_matching;

  return workers.faith_reception;
}

function matches(text: string, terms: string[]) {
  return terms.some((term) => text.includes(term));
}
