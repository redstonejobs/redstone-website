export type CatalogueOption = {
  value: string;
  label: string;
};

export type SkillLevelValue = "unskilled" | "semi_skilled" | "skilled" | "professional";

export type OccupationContent = {
  short_description: string;
  full_description: string;
  responsibilities: readonly string[];
  requirements: readonly string[];
  experience_guidance: string;
  education_guidance: string;
  language_guidance: string;
  physical_requirements: string;
};

export type JobOccupation = {
  name: string;
  slug: string;
  category: string;
  skill_level: SkillLevelValue;
  is_active: true;
  sort_order: number;
  keywords: readonly string[];
} & OccupationContent;

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
  group.occupations.map((name, occupationIndex) => {
    const occupation = {
      name,
      slug: occupationSlug(name),
      category: group.category,
      skill_level: (occupationSkillOverrides as Partial<Record<string, SkillLevelValue>>)[name] ?? group.skill_level,
      is_active: true,
      sort_order: (groupIndex + 1) * 1000 + occupationIndex + 1,
      keywords: [...group.keywords, ...occupationKeywords(name)],
    };

    return {
      ...occupation,
      ...occupationContent(occupation),
    };
  }),
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

export type JobContentSource = "job" | "occupation" | "fallback";

export type ResolvedJobContent = {
  occupation: JobOccupation | null;
  source: Record<keyof OccupationContent, JobContentSource>;
} & OccupationContent;

export type JobContentCandidate = {
  title?: string | null;
  slug?: string | null;
  job_type?: string | null;
  category?: string | null;
  skill_level?: string | null;
  short_description?: string | null;
  description?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  experience_requirements?: string | null;
  education_requirements?: string | null;
  language_requirements?: string | null;
  physical_requirements?: string | null;
};

export function findOccupationBySlug(slug: string | null | undefined) {
  const normalized = typeof slug === "string" ? slug.trim() : "";
  if (!normalized) return null;
  return JOB_OCCUPATIONS.find((occupation) => occupation.slug === normalized) ?? null;
}

export function findOccupationForJob(job: JobContentCandidate) {
  const title = normalizeSearchText(job.title ?? "");
  const jobType = normalizeSearchText(job.job_type ?? "");
  const slug = typeof job.slug === "string" ? job.slug.trim().toLowerCase() : "";
  const exact = JOB_OCCUPATIONS.find((occupation) => {
    const name = normalizeSearchText(occupation.name);
    return name === title || name === jobType || slug.startsWith(occupation.slug);
  });
  if (exact) return exact;

  const category = normalizeSearchText(job.category ?? "");
  const categoryMatches = JOB_OCCUPATIONS.filter((occupation) => normalizeSearchText(occupation.category) === category);
  if (categoryMatches.length === 1) return categoryMatches[0];

  const skillLevel = job.skill_level ?? "";
  return categoryMatches.find((occupation) => occupation.skill_level === skillLevel) ?? null;
}

export function resolveOccupationJobContent(job: JobContentCandidate): ResolvedJobContent {
  const occupation = findOccupationForJob(job);
  const fallback = genericOccupationContent(job.title || job.job_type || "This role");

  return {
    occupation,
    short_description: resolveText(job.short_description, occupation?.short_description, fallback.short_description),
    full_description: resolveText(job.description, occupation?.full_description, fallback.full_description),
    responsibilities: resolveList(job.responsibilities, occupation?.responsibilities, fallback.responsibilities),
    requirements: resolveList(job.requirements, occupation?.requirements, fallback.requirements),
    experience_guidance: resolveText(job.experience_requirements, occupation?.experience_guidance, fallback.experience_guidance),
    education_guidance: resolveText(job.education_requirements, occupation?.education_guidance, fallback.education_guidance),
    language_guidance: resolveText(job.language_requirements, occupation?.language_guidance, fallback.language_guidance),
    physical_requirements: resolveText(job.physical_requirements, occupation?.physical_requirements, fallback.physical_requirements),
    source: {
      short_description: sourceFor(job.short_description, occupation?.short_description),
      full_description: sourceFor(job.description, occupation?.full_description),
      responsibilities: sourceFor(job.responsibilities, occupation?.responsibilities?.join("\n")),
      requirements: sourceFor(job.requirements, occupation?.requirements?.join("\n")),
      experience_guidance: sourceFor(job.experience_requirements, occupation?.experience_guidance),
      education_guidance: sourceFor(job.education_requirements, occupation?.education_guidance),
      language_guidance: sourceFor(job.language_requirements, occupation?.language_guidance),
      physical_requirements: sourceFor(job.physical_requirements, occupation?.physical_requirements),
    },
  };
}

export function occupationContentAsText(content: ResolvedJobContent | JobOccupation) {
  return {
    short_description: content.short_description,
    description: "full_description" in content ? content.full_description : "",
    responsibilities: listText(content.responsibilities),
    requirements: listText(content.requirements),
    experience_requirements: content.experience_guidance,
    education_requirements: content.education_guidance,
    language_requirements: content.language_guidance,
    physical_requirements: content.physical_requirements,
  };
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

function occupationContent(occupation: { name: string; category: string; skill_level: SkillLevelValue }): OccupationContent {
  const { name, category, skill_level: skillLevel } = occupation;
  const lowerCategory = category.toLowerCase();
  const role = lowerRole(name);

  if (skillLevel === "professional") {
    return {
      short_description: `${name} roles support ${lowerCategory} operations through professional practice, sound judgement, accurate records and collaboration with employers, colleagues and service users.`,
      full_description: `${name} opportunities may involve professional planning, delivery, monitoring and reporting within ${lowerCategory} environments. Candidates are generally expected to apply relevant education, technical knowledge and workplace standards while adapting to employer procedures and destination requirements. The role may include reviewing information, solving work-related problems, maintaining accurate records, communicating with supervisors or clients and contributing to safe, ethical and efficient operations. Exact duties, seniority, reporting lines and compliance requirements vary by vacancy, employer and destination. Final selection normally depends on verified qualifications, relevant experience, references, interview performance and any professional recognition process that applies to the position.`,
      responsibilities: [
        `Plan and deliver ${role} duties according to employer procedures and professional standards`,
        "Maintain accurate records, reports and documentation where required",
        "Coordinate with supervisors, colleagues, clients or service users",
        "Apply relevant technical knowledge to solve routine and complex work issues",
        "Follow workplace safety, confidentiality and quality procedures",
        "Use approved systems, tools or equipment responsibly",
        "Support continuous improvement and reliable service delivery",
      ],
      requirements: [
        "Relevant education, training or professional background may be required",
        "Professional registration or recognition requirements may apply depending on the destination and employer",
        "Ability to keep accurate records and follow documented procedures",
        "Good judgement, communication and teamwork in a professional setting",
        "Previous experience may be preferred by some employers",
        "Requirements vary by vacancy, employer and destination",
      ],
      experience_guidance: "Previous experience in a related professional setting may be preferred, especially where the vacancy involves independent judgement, supervision, compliance duties or direct client service.",
      education_guidance: "Relevant diploma, degree, professional training or equivalent background may be required depending on the employer, seniority of the role and destination recognition process.",
      language_guidance: "Language requirements vary by employer and country. Candidates may need to demonstrate clear workplace communication and the ability to understand instructions, records and safety information.",
      physical_requirements: physicalGuidance(name, category, skillLevel),
    };
  }

  if (skillLevel === "skilled" || skillLevel === "semi_skilled") {
    return {
      short_description: `${name} roles apply practical trade, technical or supervisory skills to support safe, reliable and quality-focused ${lowerCategory} work for an employer.`,
      full_description: `${name} opportunities may involve skilled practical work, equipment use, inspection, maintenance, production, service delivery or team coordination within ${lowerCategory} settings. Candidates are generally expected to follow employer procedures, work safely, protect tools and materials, report issues and maintain consistent quality. Some vacancies may require trade knowledge, equipment familiarity, diagnostic ability, documentation or supervision of junior workers. Exact duties and standards vary by employer, destination and worksite. Selection may consider relevant training, experience, references, safety awareness and the ability to communicate clearly with supervisors and team members.`,
      responsibilities: [
        `Carry out ${role} duties using approved methods, tools or equipment`,
        "Inspect work areas, materials or equipment before and during tasks",
        "Follow safety procedures, quality standards and supervisor instructions",
        "Identify faults, risks or delays and report them promptly",
        "Maintain tools, equipment and work areas in good order",
        "Record completed work, incidents or maintenance needs where required",
        "Support team coordination and efficient workflow",
      ],
      requirements: [
        "Relevant trade training, technical knowledge or practical background may be required",
        "Relevant trade training or certification may be required",
        "Ability to use appropriate tools, equipment or systems safely",
        "Strong safety awareness and attention to quality",
        "Previous experience may be preferred by some employers",
        "Requirements vary by vacancy, employer and destination",
      ],
      experience_guidance: "Hands-on experience in a similar role may be preferred, particularly where the work involves tools, equipment, diagnostics, maintenance, quality checks or supervision.",
      education_guidance: "Trade training, vocational education, technical certificates or equivalent practical background may be considered depending on the vacancy and destination.",
      language_guidance: "Language requirements vary by employer and country. Clear communication is usually important for safety instructions, work orders, reporting and teamwork.",
      physical_requirements: physicalGuidance(name, category, skillLevel),
    };
  }

  return {
    short_description: `${name} roles support ${lowerCategory} operations by completing assigned tasks safely, reliably and according to employer instructions and workplace standards.`,
    full_description: `${name} opportunities may involve routine support work in ${lowerCategory} environments where reliability, punctuality, cleanliness, teamwork and willingness to follow instructions are important. Duties are usually assigned by supervisors and may include preparing work areas, moving materials, cleaning, serving customers, supporting production, assisting skilled staff or keeping facilities organised. Candidates should be ready to learn employer procedures, follow safety and hygiene rules and communicate basic work updates when needed. Exact duties, shifts and workplace conditions vary by vacancy, employer and destination. Previous experience may help, but many entry-level roles focus on attitude, attendance, basic communication and physical readiness where relevant.`,
    responsibilities: [
      `Complete assigned ${role} tasks according to supervisor instructions`,
      "Keep work areas clean, organised and safe",
      "Handle materials, supplies or equipment carefully",
      "Follow workplace safety, hygiene and conduct procedures",
      "Report problems, hazards or maintenance concerns promptly",
      "Work respectfully with supervisors, colleagues and customers where relevant",
      "Maintain punctuality, reliability and a cooperative attitude",
    ],
    requirements: [
      "Reliable, punctual and able to follow instructions",
      "Good personal hygiene and professional conduct where relevant",
      "Ability to work safely as part of a team",
      "Basic communication for workplace instructions and reporting",
      "Previous experience may be preferred by some employers",
      "Requirements vary by vacancy, employer and destination",
    ],
    experience_guidance: "Previous experience may be helpful but is not always required for entry-level roles. Employers may place greater weight on reliability, attendance, willingness to learn and safe work habits.",
    education_guidance: "Formal education requirements vary by employer and destination. Basic literacy, numeracy or task-specific training may be requested for some vacancies.",
    language_guidance: "Language requirements vary by employer and country. Basic workplace communication is commonly useful for understanding instructions, safety information and supervisor feedback.",
    physical_requirements: physicalGuidance(name, category, skillLevel),
  };
}

function genericOccupationContent(title: string): OccupationContent {
  return {
    short_description: `${title} opportunities may involve employer-assigned duties carried out safely, reliably and according to confirmed vacancy requirements.`,
    full_description: `${title} opportunities are assessed according to the confirmed vacancy details supplied by the employer. Candidates should review the role information carefully, keep their profile accurate and follow official recruitment instructions. Duties, experience expectations, education requirements, documents, schedules and workplace conditions vary by employer and destination. Red Stone presents available information for candidate planning, but final selection and any destination-specific process depend on the employer and relevant authorities. Candidates should avoid relying on unofficial promises and should use official communication channels throughout the recruitment process.`,
    responsibilities: [
      "Follow employer instructions and confirmed workplace procedures",
      "Complete assigned duties safely and responsibly",
      "Communicate work updates or concerns through the correct channels",
      "Maintain professional conduct and accurate personal information",
      "Prepare requested documents only through official recruitment guidance",
    ],
    requirements: [
      "Requirements vary by vacancy, employer and destination",
      "Candidates should keep identity, profile and supporting documents accurate",
      "Previous experience may be preferred by some employers",
      "Education or training requirements depend on the confirmed vacancy",
    ],
    experience_guidance: "Experience expectations vary by employer and vacancy. Candidates should rely on the confirmed job record and employer review process.",
    education_guidance: "Education requirements vary by role, employer and destination. Any required documents should be confirmed through official channels.",
    language_guidance: "Language requirements vary by employer and country. Candidates should be ready to follow workplace instructions and communicate clearly where required.",
    physical_requirements: "Physical or occupational requirements vary by vacancy and workplace. Candidates should review confirmed employer requirements before applying.",
  };
}

function physicalGuidance(name: string, category: string, skillLevel: SkillLevelValue) {
  const text = normalizeSearchText(`${name} ${category}`);
  const physical = [
    "clean",
    "housekeep",
    "farm",
    "forestry",
    "construction",
    "loader",
    "warehouse",
    "factory",
    "driver",
    "operator",
    "kitchen",
    "laundry",
    "car wash",
    "garbage",
    "security",
    "maintenance",
    "caretaker",
    "groundskeeper",
    "porter",
    "waiter",
    "nurse",
    "caregiver",
    "technician",
    "welder",
    "plumber",
    "electrician",
    "carpenter",
    "mason",
    "scaffold",
    "tiler",
  ].some((word) => text.includes(word));

  if (physical) {
    return "The role may involve standing, walking, lifting, repetitive tasks, use of tools or work in active environments depending on the vacancy. Candidates should review confirmed employer requirements and disclose any relevant limitations honestly.";
  }

  if (skillLevel === "professional") {
    return "Physical requirements are usually role-specific and may relate to workplace attendance, screen-based work, site visits or safe movement within employer facilities. Confirmed vacancy details should be reviewed before applying.";
  }

  return "Physical requirements vary by employer and worksite. Some roles may involve standing, lifting, carrying, cleaning or other routine manual tasks.";
}

function lowerRole(name: string) {
  return name.replace(/\s*\([^)]*\)/g, "").toLowerCase();
}

function listText(items: readonly string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function resolveText(jobText: string | null | undefined, occupationText: string | null | undefined, fallbackText: string) {
  return jobText?.trim() || occupationText?.trim() || fallbackText;
}

function resolveList(jobText: string | null | undefined, occupationItems: readonly string[] | undefined, fallbackItems: readonly string[]) {
  if (jobText?.trim()) return splitList(jobText);
  if (occupationItems?.length) return occupationItems;
  return fallbackItems;
}

function splitList(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function sourceFor(jobText: string | null | undefined, occupationText: string | null | undefined) {
  if (jobText?.trim()) return "job";
  if (occupationText?.trim()) return "occupation";
  return "fallback";
}

function normalizeSearchText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}
