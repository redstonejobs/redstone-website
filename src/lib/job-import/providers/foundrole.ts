import "server-only";

import { safeHttpUrl } from "../classify";
import type { ExternalJobCandidate } from "../types";

type SearchSpec = { query: string; location: string };

type FoundRoleJob = Record<string, unknown> & {
  id?: string;
  title?: string;
  companyName?: string;
  location?: string;
  salary?: string | null;
  url?: string;
  employmentType?: string | null;
  postedAt?: string | null;
  descriptionSnippet?: string | null;
  description?: string | null;
  category?: string | null;
  workLocationType?: string | null;
  skills?: string[];
  benefits?: string[];
  insights?: { ghostScore?: { grade?: string | null } | null } | null;
};

export async function fetchFoundRoleJobs(config: Record<string, unknown> = {}): Promise<ExternalJobCandidate[]> {
  const feedUrl = safeHttpUrl(process.env.FOUNDROLE_FEED_URL);
  if (feedUrl) {
    return fetchPartnerFeed(feedUrl, config);
  }

  // FoundRole documents read-only job search/details as available without sign-in.
  // Keep an optional access token for future authenticated/partner deployments, but
  // never require one for the public jobs_search flow.
  const token = process.env.FOUNDROLE_MCP_ACCESS_TOKEN?.trim() || undefined;
  return fetchViaMcp(token, config);
}

export function foundRoleRuntimeReady() {
  // The official public MCP endpoint is the default, so the read-only provider is
  // ready even when no FoundRole token/feed secret is configured.
  return true;
}

async function fetchPartnerFeed(feedUrl: string, config: Record<string, unknown>) {
  const response = await fetch(feedUrl, {
    headers: {
      Accept: "application/json",
      ...(process.env.FOUNDROLE_FEED_TOKEN
        ? { Authorization: `Bearer ${process.env.FOUNDROLE_FEED_TOKEN}` }
        : {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`FoundRole partner feed returned HTTP ${response.status}.`);
  }

  const body = await response.json() as { jobs?: FoundRoleJob[] } | FoundRoleJob[];
  const jobs = Array.isArray(body) ? body : body.jobs ?? [];
  const defaultCountry = firstConfiguredCountry(config) ?? "Canada";
  return dedupe(jobs.map((job) => normalizeFoundRoleJob(job, defaultCountry)).filter(isCandidate));
}

async function fetchViaMcp(token: string | undefined, config: Record<string, unknown>) {
  const endpoint = safeHttpUrl(process.env.FOUNDROLE_MCP_URL) ?? "https://www.foundrole.com/mcp";
  const protocolVersion = process.env.FOUNDROLE_MCP_PROTOCOL_VERSION?.trim() || "2025-06-18";
  const session = await initializeMcp(endpoint, token, protocolVersion);
  const searches = configuredSearches(config);
  const postedDaysAgo = integerConfig(config.posted_days_ago, 7, 1, 365);
  const found: ExternalJobCandidate[] = [];

  for (const search of searches) {
    const result = await mcpCall(endpoint, token, session, "jobs_search", {
      query: search.query,
      location: search.location,
      posted_days_ago: postedDaysAgo,
    });
    const payload = toolPayload(result) as { jobs?: FoundRoleJob[] } | null;
    for (const job of payload?.jobs ?? []) {
      const normalized = normalizeFoundRoleJob(job, search.location);
      if (normalized) found.push(normalized);
    }
  }

  return dedupe(found);
}

async function initializeMcp(endpoint: string, token: string | undefined, protocolVersion: string) {
  const response = await postMcp(endpoint, token, undefined, {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion,
      capabilities: {},
      clientInfo: { name: "redstone-job-importer", version: "1.0.0" },
    },
  });

  await readMcpBody(response);
  const sessionId = response.headers.get("mcp-session-id") ?? undefined;

  const notification = await postMcp(endpoint, token, sessionId, {
    jsonrpc: "2.0",
    method: "notifications/initialized",
  });
  if (!notification.ok && notification.status !== 202) {
    throw new Error(`FoundRole MCP initialization notification failed with HTTP ${notification.status}.`);
  }
  return sessionId;
}

async function mcpCall(
  endpoint: string,
  token: string | undefined,
  sessionId: string | undefined,
  name: string,
  args: Record<string, unknown>
) {
  const response = await postMcp(endpoint, token, sessionId, {
    jsonrpc: "2.0",
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    method: "tools/call",
    params: { name, arguments: args },
  });
  const body = await readMcpBody(response) as Record<string, unknown>;
  if (body.error) {
    throw new Error(`FoundRole MCP tool call failed: ${JSON.stringify(body.error).slice(0, 600)}`);
  }
  return body.result;
}

async function postMcp(
  endpoint: string,
  token: string | undefined,
  sessionId: string | undefined,
  body: Record<string, unknown>
) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: "application/json, text/event-stream",
      "Content-Type": "application/json",
      ...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`FoundRole MCP returned HTTP ${response.status}: ${text.slice(0, 500)}`);
  }
  return response;
}

async function readMcpBody(response: Response) {
  const text = await response.text();
  if (!text.trim()) return {};
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/event-stream") || text.startsWith("event:") || text.startsWith("data:")) {
    const dataLines = text
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trim())
      .filter(Boolean);
    for (let index = dataLines.length - 1; index >= 0; index -= 1) {
      try { return JSON.parse(dataLines[index]); } catch { /* keep looking */ }
    }
    throw new Error("FoundRole MCP returned an unreadable event-stream response.");
  }
  return JSON.parse(text);
}

function toolPayload(result: unknown) {
  if (!result || typeof result !== "object") return null;
  const record = result as Record<string, unknown>;
  if (record.structuredContent && typeof record.structuredContent === "object") return record.structuredContent;
  const content = Array.isArray(record.content) ? record.content : [];
  for (const item of content) {
    if (!item || typeof item !== "object") continue;
    const text = (item as { text?: unknown }).text;
    if (typeof text !== "string") continue;
    try { return JSON.parse(text); } catch { /* try next block */ }
  }
  return record;
}

function normalizeFoundRoleJob(job: FoundRoleJob, countryHint: string): ExternalJobCandidate | null {
  const externalId = stringValue(job.id);
  const title = stringValue(job.title);
  const sourceUrl = safeHttpUrl(stringValue(job.url));
  if (!externalId || !title || !sourceUrl) return null;
  const location = splitLocation(stringValue(job.location), countryHint);
  const salary = parseSalary(stringValue(job.salary));
  const description = stringValue(job.description);
  const deadline = extractDeadline(description);
  const vacancies = extractVacancies(description);

  return {
    provider: "foundrole",
    externalId,
    title,
    companyName: stringValue(job.companyName) || null,
    country: location.country,
    city: location.city,
    sourceUrl,
    applyUrl: sourceUrl,
    postedAt: stringValue(job.postedAt) || null,
    deadline,
    description: description || null,
    descriptionSnippet: stringValue(job.descriptionSnippet) || null,
    category: stringValue(job.category) || null,
    employmentType: stringValue(job.employmentType) || null,
    workLocationType: stringValue(job.workLocationType) || null,
    salaryMin: salary.min,
    salaryMax: salary.max,
    salaryCurrency: salary.currency,
    salaryPeriod: salary.period,
    vacancies,
    skills: Array.isArray(job.skills) ? job.skills.filter((item): item is string => typeof item === "string") : [],
    benefits: Array.isArray(job.benefits) ? job.benefits.filter((item): item is string => typeof item === "string") : [],
    sourceTrustGrade: job.insights?.ghostScore?.grade ?? null,
    raw: job,
  };
}

function configuredSearches(config: Record<string, unknown>): SearchSpec[] {
  const raw = Array.isArray(config.searches) ? config.searches : [];
  const searches = raw.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const query = stringValue((entry as Record<string, unknown>).query);
    const location = stringValue((entry as Record<string, unknown>).location);
    return query && location ? [{ query, location }] : [];
  });
  return searches.length ? searches : [
    { query: "Caregiver", location: "Canada" },
    { query: "Cleaner", location: "Canada" },
    { query: "Warehouse Worker", location: "Canada" },
    { query: "Security Guard", location: "Canada" },
    { query: "Delivery Driver", location: "Canada" },
  ];
}

function firstConfiguredCountry(config: Record<string, unknown>) {
  return configuredSearches(config)[0]?.location ?? null;
}

function splitLocation(value: string, countryHint: string) {
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
  const hint = countryHint.trim() || "Canada";
  if (!value) return { city: null, country: hint };
  if (/canada/i.test(value)) return { city: parts[0] ?? null, country: "Canada" };
  return { city: parts[0] ?? value, country: /canada/i.test(hint) ? "Canada" : hint };
}

function parseSalary(value: string) {
  const currency = /CA\$|CAD/i.test(value) ? "CAD" : /US\$|USD/i.test(value) ? "USD" : null;
  const period = /\/hr|per hour|hourly/i.test(value) ? "hour" as const
    : /\/yr|per year|annual/i.test(value) ? "year" as const
      : /\/month|per month/i.test(value) ? "month" as const
        : /\/week|per week/i.test(value) ? "week" as const
          : /\/day|per day/i.test(value) ? "day" as const : null;
  const numbers = [...value.matchAll(/(?:CA\$|US\$|\$)?\s*([0-9]+(?:\.[0-9]+)?)(K)?/gi)]
    .map((match) => Number(match[1]) * (match[2] ? 1000 : 1))
    .filter(Number.isFinite);
  return { min: numbers[0] ?? null, max: numbers[1] ?? numbers[0] ?? null, currency, period };
}

function extractDeadline(text: string) {
  const match = text.match(/application deadline[:\s|*-]+([A-Za-z]+\s+\d{1,2},?\s+20\d{2})/i);
  if (!match) return null;
  const parsed = new Date(match[1]);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
}

function extractVacancies(text: string) {
  const match = text.match(/(?:\(|\b)(\d{1,4})\s+(?:open\s+)?(?:positions?|vacanc(?:y|ies))/i);
  return match ? Math.max(1, Number(match[1])) : 1;
}

function integerConfig(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isCandidate(value: ExternalJobCandidate | null): value is ExternalJobCandidate {
  return value !== null;
}

function dedupe(jobs: ExternalJobCandidate[]) {
  return [...new Map(jobs.map((job) => [job.externalId, job])).values()];
}
