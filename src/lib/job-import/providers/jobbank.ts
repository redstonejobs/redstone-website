import "server-only";

import { safeHttpUrl } from "../classify";
import type { ExternalJobCandidate } from "../types";

export function jobBankRuntimeReady() {
  return Boolean(process.env.JOBBANK_XML_FEED_URL?.trim());
}

export async function fetchJobBankJobs(): Promise<ExternalJobCandidate[]> {
  const feedUrl = safeHttpUrl(process.env.JOBBANK_XML_FEED_URL);
  if (!feedUrl) {
    throw new Error(
      "Canada Job Bank import is intentionally disabled until an authorized XML feed URL is configured in JOBBANK_XML_FEED_URL. The importer does not scrape Job Bank."
    );
  }

  const response = await fetch(feedUrl, {
    headers: {
      Accept: "application/xml, text/xml, application/json;q=0.8",
      ...(process.env.JOBBANK_XML_FEED_TOKEN
        ? { Authorization: `Bearer ${process.env.JOBBANK_XML_FEED_TOKEN}` }
        : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Canada Job Bank feed returned HTTP ${response.status}.`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  const text = await response.text();
  const jobs = contentType.includes("json") || text.trim().startsWith("{") || text.trim().startsWith("[")
    ? parseJsonFeed(text)
    : parseXmlFeed(text);

  if (!jobs.length) {
    throw new Error(
      "Canada Job Bank feed was reachable but no job records could be normalized. Update the authorized-feed field mapping after reviewing the feed schema."
    );
  }

  return [...new Map(jobs.map((job) => [job.externalId, job])).values()];
}

function parseJsonFeed(text: string): ExternalJobCandidate[] {
  const parsed = JSON.parse(text) as unknown;
  const rows = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { jobs?: unknown[] }).jobs)
      ? (parsed as { jobs: unknown[] }).jobs
      : [];
  return rows.flatMap((row) => normalizeRecord(asRecord(row)) ?? []);
}

function parseXmlFeed(xml: string): ExternalJobCandidate[] {
  const blocks = extractBlocks(xml, ["job", "posting", "jobPosting", "job_posting", "vacancy"]);
  return blocks.flatMap((block) => normalizeRecord(xmlRecord(block)) ?? []);
}

function normalizeRecord(record: Record<string, unknown>): ExternalJobCandidate | null {
  const externalId = first(record, ["id", "jobId", "job_id", "jobNumber", "job_number", "reference", "referenceNumber"]);
  const title = first(record, ["title", "jobTitle", "job_title", "positionTitle"]);
  const sourceUrl = safeHttpUrl(first(record, ["url", "jobUrl", "job_url", "link", "sourceUrl", "source_url", "applicationUrl", "applyUrl"]));
  if (!externalId || !title || !sourceUrl) return null;

  const location = first(record, ["city", "location", "jobLocation", "municipality"]);
  const province = first(record, ["province", "state", "region"]);
  const description = first(record, ["description", "jobDescription", "job_description", "summary"]);
  const salaryMin = numberValue(first(record, ["salaryMin", "salary_min", "minSalary", "wageMin", "wage_min"]));
  const salaryMax = numberValue(first(record, ["salaryMax", "salary_max", "maxSalary", "wageMax", "wage_max"]));
  const salaryCurrency = first(record, ["currency", "salaryCurrency", "salary_currency"]) || (salaryMin || salaryMax ? "CAD" : null);
  const salaryPeriod = normalizePeriod(first(record, ["salaryPeriod", "salary_period", "wagePeriod", "wage_period"]));
  const foreignSignal = first(record, ["foreignCandidates", "foreign_candidates", "internationalCandidates", "international_candidates", "lmiaStatus", "lmia_status", "visaSponsorship", "visa_sponsorship"]);
  const enrichedDescription = foreignSignal
    ? `${description || ""}\nImmigration / foreign-candidate source field: ${foreignSignal}`.trim()
    : description;

  return {
    provider: "jobbank",
    externalId,
    title,
    companyName: first(record, ["employer", "employerName", "employer_name", "company", "companyName"]) || null,
    country: "Canada",
    city: [location, province].filter(Boolean).join(", ") || null,
    sourceUrl,
    applyUrl: safeHttpUrl(first(record, ["applicationUrl", "application_url", "applyUrl", "apply_url"])) || sourceUrl,
    postedAt: first(record, ["postedAt", "posted_at", "datePosted", "date_posted", "publicationDate", "publication_date"]) || null,
    deadline: normalizeDate(first(record, ["deadline", "applicationDeadline", "application_deadline", "closingDate", "closing_date"])),
    description: enrichedDescription || null,
    descriptionSnippet: first(record, ["summary", "descriptionSnippet", "description_snippet"]) || null,
    category: first(record, ["category", "occupation", "nocTitle", "noc_title"]) || null,
    employmentType: first(record, ["employmentType", "employment_type", "terms", "jobType", "job_type"]) || null,
    salaryMin,
    salaryMax,
    salaryCurrency,
    salaryPeriod,
    vacancies: Math.max(1, numberValue(first(record, ["vacancies", "numberOfPositions", "number_of_positions"])) ?? 1),
    raw: record,
  };
}

function extractBlocks(xml: string, names: string[]) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "gi");
    const matches = [...xml.matchAll(regex)].map((match) => match[1]);
    if (matches.length) return matches;
  }
  return [];
}

function xmlRecord(block: string) {
  const record: Record<string, string> = {};
  const regex = /<([A-Za-z0-9_:-]+)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g;
  for (const match of block.matchAll(regex)) {
    const key = match[1].split(":").pop() || match[1];
    const value = decodeXml(stripTags(match[2])).trim();
    if (value && !(key in record)) record[key] = value;
  }
  return record;
}

function stripTags(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, " ");
}

function decodeXml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

function first(record: Record<string, unknown>, keys: string[]) {
  const normalized = new Map(Object.entries(record).map(([key, value]) => [key.toLowerCase().replace(/[^a-z0-9]/g, ""), value]));
  for (const key of keys) {
    const value = normalized.get(key.toLowerCase().replace(/[^a-z0-9]/g, ""));
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function numberValue(value: string) {
  if (!value) return null;
  const match = value.replaceAll(",", "").match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeDate(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function normalizePeriod(value: string): ExternalJobCandidate["salaryPeriod"] {
  const text = value.toLowerCase();
  if (text.includes("hour")) return "hour";
  if (text.includes("day")) return "day";
  if (text.includes("week")) return "week";
  if (text.includes("month")) return "month";
  if (text.includes("year") || text.includes("annual")) return "year";
  return null;
}
