export type CatalogueOption = {
  value: string;
  label: string;
};

export type SkillLevelValue = "unskilled" | "semi_skilled" | "skilled" | "professional";

export type JobOccupation = {
  name: string;
  slug: string;
  category: string;
  skill_level: SkillLevelValue;
  is_active: true;
  sort_order: number;
  keywords: readonly string[];
};

export const ENTRY_LEVEL_JOB_CATEGORIES = [
  "General Support & Maintenance",
  "Agriculture, Farm & Forestry",
  "Construction & Site Support",
  "Cleaning & Housekeeping",
  "Hospitality & Restaurant",
  "Factory & Warehouse",
  "Retail & Customer Support",
  "Transport & Delivery Support",
  "Hospitality",
  "Warehouse & Logistics",
  "Construction & General Labour",
  "Agriculture & Farm Work",
  "Factory & Manufacturing",
  "Security",
  "Driving & Transport",
  "Domestic & Support Work",
  "Food Production",
  "Retail Support",
  "General Workers",
] as const;

export const SKILLED_JOB_CATEGORIES = [
  "Construction & Trades",
  "Manufacturing & Industrial",
  "Transport & Logistics",
  "Business & Professional",
  "Healthcare & Medical",
  "Education & Social Services",
  "Hospitality & Culinary",
  "IT & Technology",
  "Facility Management & Security",
  "Healthcare",
  "Engineering",
  "Information Technology",
  "Construction Trades",
  "Electrical",
  "Mechanical",
  "Welding & Fabrication",
  "Plumbing",
  "Automotive",
  "Hospitality Management",
  "Finance & Accounting",
  "Administration",
  "Education",
  "Logistics & Supply Chain",
  "Skilled Drivers",
  "Technical Services",
] as const;

export const JOB_CATEGORIES = [...ENTRY_LEVEL_JOB_CATEGORIES, ...SKILLED_JOB_CATEGORIES] as const;

export const SKILL_LEVELS = [
  { value: "unskilled", label: "Entry Level" },
  { value: "semi_skilled", label: "Semi-Skilled" },
  { value: "skilled", label: "Skilled" },
  { value: "professional", label: "Professional" },
] as const satisfies CatalogueOption[];

const occupationGroups = [
  {
    category: "General Support & Maintenance",
    skill_level: "unskilled",
    keywords: ["general support", "maintenance", "office", "attendant", "helper"],
    occupations: [
      "General Support & Maintenance",
      "Office Messenger",
      "Office Cleaner",
      "Store Room Attendant",
      "Maintenance Helper",
      "Building Caretaker",
      "Courier Assistant",
      "Moving Company Helper",
      "Truck Loader",
      "Bus Cleaner",
      "Fuel Station Attendant",
      "Trolley Attendant",
      "Packing Assistant (Supermarket)",
      "Market Stall Assistant",
      "Cinema Attendant",
      "Ticketing Assistant",
      "Bellboy",
      "Resort Groundskeeper",
      "Pool Cleaner",
      "Event Setup Assistant",
      "Catering Setup Worker",
      "Stadium Cleaner",
      "Laundry Sorter",
      "Linen Attendant",
      "Hostel Assistant",
    ],
  },
  {
    category: "Agriculture, Farm & Forestry",
    skill_level: "unskilled",
    keywords: ["farm", "agriculture", "outdoor", "forestry", "plantation"],
    occupations: [
      "Farm & Outdoor Work",
      "Vineyard Worker",
      "Orchard Worker",
      "Tea Plantation Worker",
      "Coffee Plantation Worker",
      "Flower Farm Worker",
      "Fish Farm Assistant",
      "Forestry Worker",
      "Landscape Laborer",
      "Garden Maintenance Worker",
      "Tree Planter",
      "Land Clearing Worker",
    ],
  },
  {
    category: "Construction & Site Support",
    skill_level: "unskilled",
    keywords: ["construction", "site", "helper", "labour", "labor"],
    occupations: [
      "Construction & Site Support",
      "Brick Carrier",
      "Sand & Gravel Loader",
      "Road Maintenance Worker",
      "Site Cleaner",
      "Construction Watchman",
      "Asphalt Worker",
      "Drainage Worker",
      "Roofing Helper",
      "Fencing Worker",
      "Construction Labor",
      "Construction Helper",
      "General Laborer",
      "Mason Helper",
      "Carpenter Helper",
      "Electrician Helper",
      "Plumber Helper",
      "Demolition Worker",
      "Road Construction Worker",
      "Scaffolding Helper",
      "Concrete Worker Assistant",
    ],
  },
  {
    category: "Cleaning & Housekeeping",
    skill_level: "unskilled",
    keywords: ["cleaning", "cleaner", "housekeeping", "janitor", "laundry"],
    occupations: [
      "Cleaner (Commercial / Office)",
      "Housekeeper",
      "Hotel Room Attendant",
      "Laundry Attendant",
      "Car Wash Attendant",
      "Janitor",
      "Garbage Collector",
      "Public Area Cleaner",
      "Kitchen Cleaner",
      "Industrial Cleaner",
      "Restaurant Cleaner",
    ],
  },
  {
    category: "Hospitality & Restaurant",
    skill_level: "unskilled",
    keywords: ["hospitality", "restaurant", "kitchen", "catering", "food service"],
    occupations: [
      "Hospitality & Service Support",
      "Hospitality & Restaurant",
      "Hotel Porter",
      "Waiter / Waitress",
      "Kitchen Assistant",
      "Dishwasher",
      "Food Server",
      "Fast Food Crew Member",
      "Bar Attendant",
      "Room Service Attendant",
      "Catering Assistant",
      "Bakery Assistant",
    ],
  },
  {
    category: "Factory & Warehouse",
    skill_level: "unskilled",
    keywords: ["factory", "warehouse", "packing", "production", "inventory"],
    occupations: [
      "Factory & Warehouse",
      "Factory Worker",
      "Packaging Worker",
      "Production Line Worker",
      "Warehouse Worker",
      "Picker / Packer",
      "Loading & Offloading Assistant",
      "Assembly Line Worker",
      "Sorting Staff",
      "Store Helper",
      "Inventory Assistant",
    ],
  },
  {
    category: "Retail & Customer Support",
    skill_level: "unskilled",
    keywords: ["retail", "customer support", "shop", "store"],
    occupations: ["Retail & Customer Support"],
  },
  {
    category: "Transport & Delivery Support",
    skill_level: "unskilled",
    keywords: ["transport", "delivery", "driver assistant", "logistics support"],
    occupations: ["Transport & Delivery Support"],
  },
  {
    category: "Construction & Trades",
    skill_level: "skilled",
    keywords: ["construction", "trade", "certified", "site"],
    occupations: [
      "Electrician",
      "Plumber",
      "Carpenter",
      "Mason",
      "Steel Fixer",
      "Welder (Certified)",
      "Pipe Fitter",
      "Painter",
      "Scaffolder",
      "Tiler",
      "Heavy Equipment Operator",
      "Construction Supervisor",
      "Site Engineer",
    ],
  },
  {
    category: "Manufacturing & Industrial",
    skill_level: "skilled",
    keywords: ["manufacturing", "industrial", "factory", "technician", "operator"],
    occupations: [
      "CNC Machine Operator",
      "Production Supervisor",
      "Quality Control Inspector",
      "Industrial Electrician",
      "Maintenance Technician",
      "Tool & Die Maker",
      "Process Engineer",
      "Plant Operator",
      "Packaging Technologist",
      "Instrumentation Technician",
      "Boiler Operator",
      "Safety Officer (Industrial)",
      "Fabrication Engineer",
      "Assembly Line Technician",
      "Industrial Automation Technician",
    ],
  },
  {
    category: "Transport & Logistics",
    skill_level: "skilled",
    keywords: ["transport", "logistics", "warehouse", "fleet", "shipping"],
    occupations: [
      "Truck Driver (Heavy Commercial)",
      "Forklift Operator (Certified)",
      "Supply Chain Manager",
      "Logistics Coordinator",
      "Warehouse Manager",
      "Fleet Manager",
      "Crane Operator",
      "Delivery Supervisor",
      "Shipping Coordinator",
      "Transport Planner",
    ],
  },
  {
    category: "Business & Professional",
    skill_level: "professional",
    keywords: ["business", "finance", "management", "office", "professional"],
    occupations: [
      "Accountant",
      "Auditor",
      "Financial Analyst",
      "Human Resource Manager",
      "Marketing Manager",
      "Digital Marketing Specialist",
      "Procurement Officer",
      "Project Manager",
      "Business Analyst",
      "Compliance Officer",
    ],
  },
  {
    category: "Healthcare & Medical",
    skill_level: "professional",
    keywords: ["healthcare", "medical", "nurse", "clinical", "hospital"],
    occupations: [
      "Registered Nurse",
      "Clinical Officer",
      "Medical Laboratory Technologist",
      "Radiographer",
      "Pharmacist",
      "Physiotherapist",
      "Caregiver (Certified)",
      "Dental Hygienist",
      "Occupational Therapist",
      "Sonographer",
      "ICU Nurse",
      "Theatre Nurse",
      "Midwife",
      "Medical Records Officer",
      "Public Health Officer",
    ],
  },
  {
    category: "Education & Social Services",
    skill_level: "professional",
    keywords: ["education", "teacher", "training", "social services", "community"],
    occupations: [
      "Secondary School Teacher",
      "Mathematics Teacher",
      "Science Teacher",
      "Early Childhood Teacher",
      "Special Needs Teacher",
      "University Lecturer",
      "Guidance Counsellor",
      "Social Worker",
      "Community Development Officer",
      "Vocational Trainer",
    ],
  },
  {
    category: "Hospitality & Culinary",
    skill_level: "skilled",
    keywords: ["hospitality", "culinary", "hotel", "restaurant", "food"],
    occupations: [
      "Chef",
      "Pastry Chef",
      "Hotel Manager",
      "Restaurant Supervisor",
      "Front Office Manager",
      "Housekeeping Supervisor",
      "Barista",
      "Food & Beverage Manager",
      "Catering Manager",
    ],
  },
  {
    category: "IT & Technology",
    skill_level: "professional",
    keywords: ["it", "technology", "software", "data", "network"],
    occupations: [
      "Software Engineer",
      "Web Developer",
      "Mobile App Developer",
      "Cyber Security Specialist",
      "Network Engineer",
      "Data Analyst",
      "Data Scientist",
      "IT Support Specialist",
      "Cloud Engineer",
      "DevOps Engineer",
      "Database Administrator",
      "AI Engineer",
      "UI/UX Designer",
      "Systems Administrator",
      "Blockchain Developer",
    ],
  },
  {
    category: "Facility Management & Security",
    skill_level: "skilled",
    keywords: ["facility", "security", "property", "safety", "cctv"],
    occupations: [
      "Facility Manager",
      "Property Manager",
      "Building Inspector",
      "Estate Manager",
      "Security Systems Technician",
      "Fire Safety Officer",
      "Access Control Technician",
      "Surveillance Technician (CCTV Specialist)",
      "Environmental Health Officer",
      "Waste Management Supervisor",
    ],
  },
] as const satisfies readonly {
  category: string;
  skill_level: SkillLevelValue;
  keywords: readonly string[];
  occupations: readonly string[];
}[];

const occupationSkillOverrides = {
  "Supply Chain Manager": "professional",
  "Warehouse Manager": "professional",
  "Fleet Manager": "professional",
  "Transport Planner": "professional",
  "Process Engineer": "professional",
  "Fabrication Engineer": "professional",
  "Site Engineer": "professional",
  "Caregiver (Certified)": "skilled",
  "Medical Records Officer": "skilled",
  "IT Support Specialist": "skilled",
  "Facility Manager": "professional",
  "Property Manager": "professional",
  "Building Inspector": "professional",
  "Estate Manager": "professional",
  "Environmental Health Officer": "professional",
  "Waste Management Supervisor": "professional",
} as const satisfies Partial<Record<string, SkillLevelValue>>;

export const JOB_OCCUPATIONS = occupationGroups.flatMap((group, groupIndex) =>
  group.occupations.map((name, occupationIndex) => ({
    name,
    slug: occupationSlug(name),
    category: group.category,
    skill_level: (occupationSkillOverrides as Partial<Record<string, SkillLevelValue>>)[name] ?? group.skill_level,
    is_active: true,
    sort_order: (groupIndex + 1) * 1000 + occupationIndex + 1,
    keywords: [...group.keywords, ...occupationKeywords(name)],
  })),
) as JobOccupation[];

export const JOB_OCCUPATION_OPTIONS = JOB_OCCUPATIONS.map((occupation) => ({
  value: occupation.name,
  label: occupation.name,
})) satisfies CatalogueOption[];

export function occupationsForCategory(category: string) {
  return JOB_OCCUPATIONS.filter((occupation) => occupation.category === category);
}

export function occupationsForSkillLevel(skillLevel: SkillLevelValue | string) {
  return JOB_OCCUPATIONS.filter((occupation) => occupation.skill_level === skillLevel);
}

export function occupationSearchTerms(query: string) {
  const normalized = normalizeSearchText(query);
  if (!normalized) return [];

  const terms = new Set<string>();
  for (const occupation of JOB_OCCUPATIONS) {
    const haystack = normalizeSearchText([occupation.name, occupation.category, ...occupation.keywords].join(" "));
    if (!haystack.includes(normalized)) continue;
    terms.add(occupation.name);
    terms.add(occupation.category);
  }

  return [...terms].slice(0, 20);
}

export const SALARY_PERIODS = [
  { value: "hour", label: "Hour" },
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "year", label: "Year" },
] as const satisfies CatalogueOption[];

export const CONTRACT_TYPES = ["Fixed Term", "Permanent", "Seasonal", "Temporary", "Employer Specific"] as const;

export const BENEFIT_STATUSES = [
  { value: "included", label: "Included" },
  { value: "not_included", label: "Not Included" },
  { value: "allowance", label: "Allowance" },
  { value: "employer_specific", label: "Employer Specific" },
  { value: "not_confirmed", label: "Not Confirmed" },
] as const satisfies CatalogueOption[];

export const COST_RESPONSIBILITIES = [
  { value: "candidate", label: "Candidate" },
  { value: "employer", label: "Employer" },
  { value: "red_stone", label: "Red Stone" },
  { value: "shared", label: "Shared" },
  { value: "not_confirmed", label: "Not Confirmed" },
] as const satisfies CatalogueOption[];

export const FEE_RELATIONSHIPS = [
  { value: "included_in_programme_fee", label: "Included in Programme Fee" },
  { value: "additional", label: "Additional" },
  { value: "candidate_provided", label: "Candidate Provided" },
  { value: "employer_covered", label: "Employer Covered" },
  { value: "shared", label: "Shared" },
  { value: "not_confirmed", label: "Not Confirmed" },
] as const satisfies CatalogueOption[];

export const DOCUMENT_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "cv_cover_letter", label: "CV / Cover Letter" },
  { value: "cover_letter", label: "Cover Letter" },
  { value: "police_clearance", label: "Police Clearance" },
  { value: "health_certificate", label: "Health Certificate / Medical" },
  { value: "nea_clearance", label: "NEA Clearance" },
  { value: "consultant_letter", label: "Consultant Letter" },
  { value: "passport_photo", label: "Passport Photo" },
  { value: "national_id", label: "National ID" },
  { value: "academic_certificate", label: "Academic Certificate" },
  { value: "professional_certificate", label: "Professional Certificate" },
  { value: "employment_reference", label: "Employment Reference" },
  { value: "ielts", label: "IELTS / Language Test" },
  { value: "attestation", label: "Attestation" },
  { value: "driving_licence", label: "Driving Licence" },
  { value: "trade_certificate", label: "Trade Certificate" },
  { value: "other", label: "Other" },
] as const satisfies CatalogueOption[];

export function labelFor(options: readonly CatalogueOption[], value: unknown) {
  const text = typeof value === "string" ? value : "";
  return options.find((option) => option.value === text)?.label ?? text.replaceAll("_", " ");
}

export function skillLevelLabel(value: unknown) {
  return labelFor(SKILL_LEVELS, value);
}

export function benefitStatusLabel(value: unknown) {
  return labelFor(BENEFIT_STATUSES, value || "not_confirmed");
}

export function feeRelationshipLabel(value: unknown) {
  return labelFor(FEE_RELATIONSHIPS, value || "not_confirmed");
}

export function documentTypeLabel(value: unknown) {
  return labelFor(DOCUMENT_TYPES, value);
}

function occupationSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\//g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function occupationKeywords(name: string) {
  const normalized = normalizeSearchText(name);
  const keywords = new Set(normalized.split(" ").filter((word) => word.length > 2));

  if (normalized.includes("housekeep")) keywords.add("housekeeping");
  if (normalized.includes("warehouse")) keywords.add("warehouse");
  if (normalized.includes("certified welder") || normalized.includes("welder certified")) keywords.add("certified welder");
  if (normalized.includes("waiter") || normalized.includes("waitress")) keywords.add("server");
  if (normalized.includes("cctv")) keywords.add("surveillance");

  return [...keywords];
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
