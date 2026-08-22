import { createClient } from "@/utils/supabase/server";
import type { Row } from "@/lib/admin/types";

export type Country = {
  id?: string;
  name: string;
  countryName: string;
  countryCode: string;
  slug: string;
  aliases: string[];
  region: string;
  currency: string | null;
  baseRecruitmentFee: number | null;
  feeCurrency: string;
  feeLabel: string;
  processingTimeMin: number | null;
  processingTimeMax: number | null;
  processingTimeUnit: string | null;
  processingTimeNote: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  shortDescription: string;
  sectors: string[];
  preparationTips: string[];
  publishedJobCount?: number;
};

type CountrySeed = Omit<
  Country,
  "shortDescription" | "sectors" | "preparationTips" | "publishedJobCount"
>;

const defaultTips = [
  "Keep your CV current and consistent with your documents.",
  "Prepare verified education, employment and identity records.",
  "Confirm every vacancy through official Red Stone channels before acting.",
];

const sectorsByRegion: Record<string, string[]> = {
  Gulf: ["Hospitality", "Facilities", "Logistics", "Construction", "Domestic Support"],
  "North America": ["Healthcare", "Hospitality", "Logistics", "Construction", "Technical Services"],
  Europe: ["Healthcare", "Hospitality", "Logistics", "Construction Trades", "Technical Services"],
  Oceania: ["Healthcare", "Agriculture", "Hospitality", "Construction", "Technical Services"],
  Asia: ["Hospitality", "Logistics", "Food Production", "Technical Services", "Retail Support"],
  "South America": ["Agriculture", "Hospitality", "Logistics", "Construction", "Technical Services"],
};

const countrySeeds: CountrySeed[] = [
  seed("US", "United States", "united-states", ["USA", "US", "United States"], "North America", 450000, true, 10),
  seed("CA", "Canada", "canada", ["Canada"], "North America", 400000, true, 20),
  seed("AE", "UAE", "uae", ["UAE", "United Arab Emirates"], "Gulf", 150000, true, 30),
  seed("QA", "Qatar", "qatar", ["Qatar"], "Gulf", 150000, true, 40),
  seed("KW", "Kuwait", "kuwait", ["Kuwait"], "Gulf", 150000, true, 50),
  seed("BH", "Bahrain", "bahrain", ["Bahrain"], "Gulf", 150000, false, 60),
  seed("OM", "Oman", "oman", ["Oman"], "Gulf", 150000, false, 70),
  seed("AU", "Australia", "australia", ["Australia"], "Oceania", 400000, true, 80),
  seed("NZ", "New Zealand", "new-zealand", ["New Zealand"], "Oceania", 300000, false, 90),
  seed("CL", "Chile", "chile", ["Chile"], "South America", 300000, false, 100),
  seed("PE", "Peru", "peru", ["Peru"], "South America", 300000, false, 110),
  seed("SG", "Singapore", "singapore", ["Singapore"], "Asia", 150000, true, 120),
  seed("GB", "United Kingdom", "united-kingdom", ["UK", "United Kingdom"], "Europe", 400000, true, 130),
  seed("DE", "Germany", "germany", ["Germany"], "Europe", 400000, true, 140),
  seed("FR", "France", "france", ["France"], "Europe", 400000, false, 150),
  seed("IT", "Italy", "italy", ["Italy"], "Europe", 300000, false, 160),
  seed("NL", "Netherlands", "netherlands", ["Netherlands"], "Europe", 250000, false, 170),
  seed("CH", "Switzerland", "switzerland", ["Switzerland"], "Europe", 300000, false, 180),
  seed("SE", "Sweden", "sweden", ["Sweden"], "Europe", 300000, false, 190),
  seed("NO", "Norway", "norway", ["Norway"], "Europe", 400000, false, 200),
  seed("DK", "Denmark", "denmark", ["Denmark"], "Europe", 400000, false, 210),
  seed("FI", "Finland", "finland", ["Finland"], "Europe", 350000, false, 220),
  seed("PL", "Poland", "poland", ["Poland"], "Europe", 300000, false, 230),
  seed("AT", "Austria", "austria", ["Austria"], "Europe", 400000, false, 240),
  seed("IE", "Ireland", "ireland", ["Ireland"], "Europe", 400000, false, 250),
  seed("LU", "Luxembourg", "luxembourg", ["Luxembourg"], "Europe", 250000, false, 260),
];

export const COUNTRIES: Country[] = countrySeeds.map(enrichCountry);

export async function getConfiguredCountries() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("country_recruitment_settings")
    .select("id, country_code, country_name, slug, aliases, region, currency, base_recruitment_fee, fee_currency, fee_label, processing_time_min, processing_time_max, processing_time_unit, processing_time_note, is_active, is_featured, display_order")
    .eq("is_active", true)
    .order("display_order", { ascending: true })
    .returns<Row[]>();

  if (error || !data?.length) {
    return COUNTRIES;
  }

  return data.map(rowToCountry);
}

export async function getConfiguredCountry(slug: string) {
  const countries = await getConfiguredCountries();
  return findCountry(countries, slug);
}

export async function getCountriesWithPublishedCounts() {
  const supabase = await createClient();
  const countries = await getConfiguredCountries();
  const { data } = await supabase
    .from("jobs")
    .select("country")
    .eq("status", "published")
    .returns<Row[]>();
  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    const country = normalizeCountryName(String(row.country ?? ""));
    counts.set(country, (counts.get(country) ?? 0) + 1);
  }

  return countries.map((country) => ({
    ...country,
    publishedJobCount: counts.get(normalizeCountryName(country.name)) ?? 0,
  }));
}

export function getCountry(slug: string) {
  return findCountry(COUNTRIES, slug);
}

export function findCountry(countries: Country[], value: string | null | undefined) {
  const normalized = normalizeCountryName(value ?? "");
  return countries.find((country) =>
    [country.slug, country.name, country.countryName, country.countryCode, ...country.aliases]
      .map(normalizeCountryName)
      .includes(normalized)
  );
}

export function normalizeCountryName(value: string) {
  const normalized = value.trim().toLowerCase();
  if (["usa", "us", "united states"].includes(normalized)) return "united states";
  if (["uk", "united kingdom"].includes(normalized)) return "united kingdom";
  if (["uae", "united arab emirates"].includes(normalized)) return "uae";
  return normalized;
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function seed(
  countryCode: string,
  countryName: string,
  slug: string,
  aliases: string[],
  region: string,
  baseRecruitmentFee: number,
  isFeatured: boolean,
  displayOrder: number
): CountrySeed {
  return {
    countryCode,
    name: countryName,
    countryName,
    slug,
    aliases,
    region,
    currency: null,
    baseRecruitmentFee,
    feeCurrency: "KES",
    feeLabel: "Estimated Programme Cost",
    processingTimeMin: null,
    processingTimeMax: null,
    processingTimeUnit: null,
    processingTimeNote: null,
    isActive: true,
    isFeatured,
    displayOrder,
  };
}

function enrichCountry(country: CountrySeed): Country {
  return {
    ...country,
    shortDescription: "Explore recruitment opportunities and preparation guidance for candidates considering this destination.",
    sectors: sectorsByRegion[country.region] ?? ["Healthcare", "Hospitality", "Logistics", "Construction", "Technical Services"],
    preparationTips: defaultTips,
  };
}

function rowToCountry(row: Row): Country {
  return enrichCountry({
    id: String(row.id),
    countryCode: String(row.country_code ?? ""),
    name: String(row.country_name ?? ""),
    countryName: String(row.country_name ?? ""),
    slug: String(row.slug ?? ""),
    aliases: Array.isArray(row.aliases) ? row.aliases.map(String) : [],
    region: String(row.region ?? ""),
    currency: typeof row.currency === "string" ? row.currency : null,
    baseRecruitmentFee: numberOrNull(row.base_recruitment_fee),
    feeCurrency: String(row.fee_currency ?? "KES"),
    feeLabel: String(row.fee_label ?? "Estimated Programme Cost"),
    processingTimeMin: numberOrNull(row.processing_time_min),
    processingTimeMax: numberOrNull(row.processing_time_max),
    processingTimeUnit: typeof row.processing_time_unit === "string" ? row.processing_time_unit : null,
    processingTimeNote: typeof row.processing_time_note === "string" ? row.processing_time_note : null,
    isActive: row.is_active !== false,
    isFeatured: row.is_featured === true,
    displayOrder: numberOrNull(row.display_order) ?? 100,
  });
}

function numberOrNull(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}
