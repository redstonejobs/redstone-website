export type Country = {
  name: string;
  slug: string;
  region: string;
  shortDescription: string;
  sectors: string[];
  preparationTips: string[];
};

const countryNames = [
  ["Canada", "North America"],
  ["United Kingdom", "Europe"],
  ["Germany", "Europe"],
  ["Ireland", "Europe"],
  ["Luxembourg", "Europe"],
  ["Australia", "Oceania"],
  ["New Zealand", "Oceania"],
  ["UAE", "Middle East"],
  ["Qatar", "Middle East"],
  ["Saudi Arabia", "Middle East"],
  ["Finland", "Europe"],
  ["France", "Europe"],
  ["Italy", "Europe"],
  ["Netherlands", "Europe"],
  ["Switzerland", "Europe"],
  ["Sweden", "Europe"],
  ["Norway", "Europe"],
  ["Denmark", "Europe"],
  ["Austria", "Europe"],
  ["Poland", "Europe"],
  ["Kuwait", "Middle East"],
  ["Bahrain", "Middle East"],
  ["Oman", "Middle East"],
  ["Singapore", "Asia"],
  ["Chile", "South America"],
  ["Peru", "South America"],
] as const;

const defaultSectors = ["Healthcare", "Hospitality", "Logistics", "Construction", "Technical Services"];
const defaultTips = [
  "Keep your CV current and consistent with your documents.",
  "Prepare verified education, employment and identity records.",
  "Confirm every vacancy through official Red Stone channels before acting.",
];

export const COUNTRIES: Country[] = countryNames.map(([name, region]) => ({
  name,
  region,
  slug: slugify(name),
  shortDescription: "Explore recruitment opportunities and preparation guidance for candidates considering this destination.",
  sectors: region === "Middle East" ? ["Hospitality", "Facilities", "Logistics", "Construction", "Domestic Support"] : defaultSectors,
  preparationTips: defaultTips,
}));

export function getCountry(slug: string) {
  return COUNTRIES.find((country) => country.slug === slug);
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

