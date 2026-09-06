export type BlogSearchIntent =
  | "Jobs"
  | "Visa & Work Permit"
  | "Documents"
  | "Salary & Employment"
  | "Applications & Interviews"
  | "Safety & Compliance"
  | "Recruitment Education"
  | "Employer Guidance";

export type BlogStrategyTopic = {
  id: string;
  country: string | null;
  countrySlug: string | null;
  region: string;
  intent: BlogSearchIntent;
  priority: "High" | "Medium";
  title: string;
  primaryKeyword: string;
  category: string;
  summary: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  outline: string[];
};

type CountrySeed = {
  name: string;
  slug: string;
  region: string;
};

const countries: CountrySeed[] = [
  { name: "United States", slug: "united-states", region: "North America" },
  { name: "Canada", slug: "canada", region: "North America" },
  { name: "UAE", slug: "uae", region: "Gulf" },
  { name: "Qatar", slug: "qatar", region: "Gulf" },
  { name: "Kuwait", slug: "kuwait", region: "Gulf" },
  { name: "Bahrain", slug: "bahrain", region: "Gulf" },
  { name: "Oman", slug: "oman", region: "Gulf" },
  { name: "Australia", slug: "australia", region: "Oceania" },
  { name: "New Zealand", slug: "new-zealand", region: "Oceania" },
  { name: "Chile", slug: "chile", region: "South America" },
  { name: "Peru", slug: "peru", region: "South America" },
  { name: "Singapore", slug: "singapore", region: "Asia" },
  { name: "United Kingdom", slug: "united-kingdom", region: "Europe" },
  { name: "Germany", slug: "germany", region: "Europe" },
  { name: "France", slug: "france", region: "Europe" },
  { name: "Italy", slug: "italy", region: "Europe" },
  { name: "Netherlands", slug: "netherlands", region: "Europe" },
  { name: "Switzerland", slug: "switzerland", region: "Europe" },
  { name: "Sweden", slug: "sweden", region: "Europe" },
  { name: "Norway", slug: "norway", region: "Europe" },
  { name: "Denmark", slug: "denmark", region: "Europe" },
  { name: "Finland", slug: "finland", region: "Europe" },
  { name: "Poland", slug: "poland", region: "Europe" },
  { name: "Austria", slug: "austria", region: "Europe" },
  { name: "Ireland", slug: "ireland", region: "Europe" },
  { name: "Luxembourg", slug: "luxembourg", region: "Europe" },
];

type CountryTemplate = {
  key: string;
  intent: BlogSearchIntent;
  priority: "High" | "Medium";
  title: (country: string) => string;
  primaryKeyword: (country: string) => string;
  category: (country: string) => string;
  summary: (country: string) => string;
  seoTitle: (country: string) => string;
  metaDescription: (country: string) => string;
  keywords: (country: string) => string[];
  outline: (country: string) => string[];
};

const countryTemplates: CountryTemplate[] = [
  {
    key: "jobs-for-kenyans",
    intent: "Jobs",
    priority: "High",
    title: (country) => `${country} Jobs for Kenyans: Opportunities, Requirements & How to Apply`,
    primaryKeyword: (country) => `${country} jobs for Kenyans`,
    category: (country) => `${country} Jobs`,
    summary: (country) => `A practical guide for Kenyan candidates exploring legitimate employment opportunities in ${country}, including job types, eligibility, documents and the Red Stone application process.`,
    seoTitle: (country) => `${country} Jobs for Kenyans | Requirements & How to Apply`,
    metaDescription: (country) => `Explore ${country} jobs for Kenyans, common roles, candidate requirements, documents and how to apply through a responsible international recruitment process.`,
    keywords: (country) => [`${country} jobs for Kenyans`, `jobs in ${country} from Kenya`, `${country} recruitment Kenya`, `work in ${country}`],
    outline: (country) => [
      `Who this ${country} jobs guide is for`,
      `Types of jobs Kenyan candidates may encounter`,
      `Candidate eligibility and employer requirements`,
      `Documents commonly needed before application`,
      `How Red Stone recruitment and employer selection work`,
      `Work authorization, visa and final government decisions`,
    ],
  },
  {
    key: "work-visa-guide",
    intent: "Visa & Work Permit",
    priority: "High",
    title: (country) => `${country} Work Visa and Work Permit Guide for Kenyan Applicants`,
    primaryKeyword: (country) => `${country} work visa for Kenyans`,
    category: (country) => `${country} Visa & Work Permit`,
    summary: (country) => `An educational overview of the employment-related work authorization and visa journey for Kenyan applicants targeting ${country}, with clear separation between recruitment support and government decisions.`,
    seoTitle: (country) => `${country} Work Visa for Kenyans | Work Permit Guide`,
    metaDescription: (country) => `Understand the ${country} work visa and work permit journey for Kenyan applicants, including employer steps, documents, official processing and key cautions.`,
    keywords: (country) => [`${country} work visa for Kenyans`, `${country} work permit Kenya`, `${country} visa jobs`, `work authorization ${country}`],
    outline: (country) => [
      `Difference between recruitment, work authorization and visa approval`,
      `Main employment-related pathways to verify with ${country} authorities`,
      `Employer responsibilities and candidate responsibilities`,
      `Documents and compliance stages`,
      `Medical, biometric or police-clearance stages where applicable`,
      `Official sources and why current rules must be verified`,
    ],
  },
  {
    key: "in-demand-jobs",
    intent: "Jobs",
    priority: "High",
    title: (country) => `Most In-Demand Skilled and Entry-Level Jobs in ${country} for International Candidates`,
    primaryKeyword: (country) => `in demand jobs in ${country}`,
    category: (country) => `${country} Jobs`,
    summary: (country) => `A sector-by-sector article explaining the types of skilled and entry-level roles international candidates commonly research in ${country}, while distinguishing general pathways from live vacancies.`,
    seoTitle: (country) => `In-Demand Jobs in ${country} | Skilled & Entry-Level Roles`,
    metaDescription: (country) => `Explore in-demand job sectors in ${country}, including skilled and entry-level pathways, candidate profiles, licensing considerations and how to find live vacancies.`,
    keywords: (country) => [`in demand jobs in ${country}`, `skilled jobs ${country}`, `unskilled jobs ${country}`, `${country} job opportunities`],
    outline: (country) => [
      `How to interpret “in-demand” occupations`,
      `Skilled sectors candidates often research`,
      `Entry-level and general employment pathways`,
      `Licensing and qualification-recognition considerations`,
      `How to identify a real live vacancy`,
      `How to match your experience to an employer requirement`,
    ],
  },
  {
    key: "documents-guide",
    intent: "Documents",
    priority: "High",
    title: (country) => `Documents Needed to Apply for Jobs in ${country} from Kenya`,
    primaryKeyword: (country) => `documents for ${country} jobs from Kenya`,
    category: () => "Documents & Compliance",
    summary: (country) => `A candidate checklist covering the identity, CV, qualification, employment, police-clearance and destination-specific records that may be requested during recruitment for ${country}.`,
    seoTitle: (country) => `Documents for ${country} Jobs from Kenya | Candidate Checklist`,
    metaDescription: (country) => `See documents commonly needed when applying for ${country} jobs from Kenya, including CV, passport, certificates, employment evidence and compliance records.`,
    keywords: (country) => [`documents for ${country} jobs from Kenya`, `${country} job requirements`, `${country} recruitment documents`, `overseas job documents Kenya`],
    outline: (country) => [
      `Core identity and contact records`,
      `CV, work history and reference evidence`,
      `Education, skills and professional certificates`,
      `Police, medical and compliance documents where required`,
      `Translation, certification or legalization considerations`,
      `How to protect sensitive documents from recruitment fraud`,
    ],
  },
  {
    key: "salary-benefits-guide",
    intent: "Salary & Employment",
    priority: "Medium",
    title: (country) => `${country} Salary, Employment Benefits and Contract Questions for Overseas Workers`,
    primaryKeyword: (country) => `${country} job salary for foreign workers`,
    category: () => "Salary & Employment Terms",
    summary: (country) => `A responsible guide to understanding salary figures, deductions, working hours, benefits and contract terms for candidates considering employment in ${country}, using current vacancy and official information where available.`,
    seoTitle: (country) => `${country} Job Salaries & Employment Benefits for Foreign Workers`,
    metaDescription: (country) => `Learn how to evaluate ${country} job salary, benefits, working hours, deductions and employment-contract terms before accepting an overseas job offer.`,
    keywords: (country) => [`${country} job salary for foreign workers`, `${country} salaries`, `${country} employment benefits`, `${country} work contract`],
    outline: (country) => [
      `Why salary figures must be tied to a real role and employer`,
      `Gross pay, net pay and possible deductions`,
      `Working hours, overtime and leave questions`,
      `Accommodation, transport, meals and insurance where offered`,
      `How to read a written employment contract`,
      `Questions to ask before accepting an offer`,
    ],
  },
  {
    key: "interview-guide",
    intent: "Applications & Interviews",
    priority: "Medium",
    title: (country) => `How to Prepare for a ${country} Job Interview and Employer Screening`,
    primaryKeyword: (country) => `${country} job interview for Kenyans`,
    category: () => "Interviews & Applications",
    summary: (country) => `Interview preparation for candidates applying to employers in ${country}, covering vacancy research, CV consistency, practical questions, online interviews and professional follow-up.`,
    seoTitle: (country) => `${country} Job Interview Guide for Kenyan Applicants`,
    metaDescription: (country) => `Prepare for a ${country} job interview from Kenya with practical advice on employer research, CV consistency, common questions, video interviews and follow-up.`,
    keywords: (country) => [`${country} job interview for Kenyans`, `${country} interview questions`, `overseas job interview`, `${country} employer screening`],
    outline: (country) => [
      `Research the employer and vacancy before the interview`,
      `Keep CV, documents and spoken answers consistent`,
      `Prepare evidence-based examples from your experience`,
      `Video interview setup and professional communication`,
      `Questions candidates should ask the employer`,
      `What happens after employer screening`,
    ],
  },
];

const globalTopics: BlogStrategyTopic[] = [
  globalTopic("international-recruitment-process", "Recruitment Education", "High", "How International Recruitment Works: From Application to Overseas Deployment", "international recruitment process", "Recruitment Process", "A step-by-step explanation of international recruitment from vacancy search and application through employer selection, documentation, work authorization and deployment.", ["international recruitment process", "overseas recruitment Kenya", "jobs abroad process", "recruitment agency process"], ["Finding a genuine vacancy", "Application and candidate screening", "Employer interview and selection", "Documents, medicals and compliance", "Work authorization and visa stages", "Pre-departure and deployment"]),
  globalTopic("jobs-abroad-for-kenyans", "Jobs", "High", "Jobs Abroad for Kenyans: How to Find Legitimate International Opportunities", "jobs abroad for Kenyans", "Jobs Abroad", "A practical guide to finding legitimate overseas vacancies, checking employers and choosing the right destination and role.", ["jobs abroad for Kenyans", "overseas jobs Kenya", "international jobs Kenya", "work abroad Kenya"], ["Where legitimate international vacancies come from", "How to compare countries and job sectors", "How to check employer and recruiter legitimacy", "Documents to prepare early", "Application and interview process", "Fraud warning signs"]),
  globalTopic("skilled-vs-entry-level-overseas-jobs", "Jobs", "High", "Skilled vs Entry-Level Overseas Jobs: Which International Path Fits You?", "skilled vs unskilled jobs abroad", "Jobs Abroad", "A comparison of skilled, technical and entry-level international job pathways, including qualifications, experience and licensing differences.", ["skilled vs unskilled jobs abroad", "entry level jobs abroad", "skilled jobs overseas", "international jobs Kenya"], ["What makes a job skilled or regulated", "Entry-level and general work pathways", "Experience and education requirements", "Licensing and qualification recognition", "How salaries and duties can differ", "How to choose the right pathway"]),
  globalTopic("visa-sponsorship-explained", "Visa & Work Permit", "High", "Visa Sponsorship Explained: What Employer Sponsorship Does—and Does Not—Mean", "visa sponsorship jobs", "Sponsorship Guidance", "A clear explanation of employer sponsorship, work authorization and visa decisions so candidates do not confuse recruitment promises with government approval.", ["visa sponsorship jobs", "employer sponsorship", "sponsored jobs abroad", "work visa sponsorship"], ["What employer sponsorship can mean", "What sponsorship does not guarantee", "Employer and candidate responsibilities", "Work permit and visa authority roles", "How benefits should be confirmed in writing", "Common sponsorship scams"]),
  globalTopic("cv-for-international-jobs", "Applications & Interviews", "High", "How to Write a Professional CV for International Jobs", "CV for international jobs", "CV & Applications", "A practical guide to creating a clear, factual CV for international employers, including experience, skills, dates and country-specific adaptation.", ["CV for international jobs", "overseas job CV", "CV Kenya jobs abroad", "international CV format"], ["What international employers need to see", "Professional profile and contact details", "Work history with measurable duties", "Skills, education and certificates", "Avoiding inconsistencies and exaggeration", "Adapting a CV to a specific vacancy"]),
  globalTopic("overseas-job-interview", "Applications & Interviews", "High", "Overseas Job Interview Guide: Questions, Preparation and Follow-Up", "overseas job interview", "Interviews & Applications", "A complete international interview guide covering preparation, examples, online interview setup, candidate questions and follow-up.", ["overseas job interview", "international job interview questions", "job interview abroad", "video interview overseas jobs"], ["Understand the vacancy", "Prepare evidence-based examples", "Common interview themes", "Online interview setup", "Questions to ask the employer", "Professional follow-up"]),
  globalTopic("overseas-job-documents", "Documents", "High", "International Recruitment Documents Checklist for Kenyan Candidates", "overseas job documents Kenya", "Documents & Compliance", "A general checklist of identity, career, qualification, police, medical and travel-related documents that can arise during international recruitment.", ["overseas job documents Kenya", "international recruitment documents", "work abroad documents", "job application documents Kenya"], ["Identity and passport records", "CV and employment evidence", "Certificates and qualifications", "Police and compliance records", "Medical and destination requirements", "Document security and verified channels"]),
  globalTopic("police-clearance-overseas-jobs", "Documents", "Medium", "Police Clearance and Good Conduct Certificates for Overseas Recruitment", "good conduct certificate overseas jobs", "Documents & Compliance", "When police-clearance records may be requested in international recruitment, why requirements vary and how candidates should verify current instructions.", ["good conduct certificate overseas jobs", "police clearance international jobs", "certificate of good conduct Kenya jobs abroad"], ["Why employers or authorities may request clearance", "When to obtain the document", "Validity and destination differences", "How to protect the document", "What to do if information is incorrect", "Verify current official requirements"]),
  globalTopic("medical-exams-overseas-jobs", "Safety & Compliance", "High", "Medical Examinations for Overseas Jobs: What Candidates Should Know", "medical for overseas jobs", "Medicals & Compliance", "A responsible overview of recruitment medical examinations, approved providers, privacy, payment and the difference between medical assessment and recruitment decisions.", ["medical for overseas jobs", "employment medical Kenya", "visa medical Kenya", "overseas job medical"], ["Why a medical may be requested", "Who determines the required provider", "Medical privacy and consent", "Payments and receipts", "Possible follow-up steps", "Why Red Stone does not make medical decisions"]),
  globalTopic("biometrics-work-visa", "Visa & Work Permit", "Medium", "Biometrics in Work Visa Applications: What International Job Candidates Should Expect", "work visa biometrics", "Visa & Work Permit", "An educational guide to biometrics, appointment preparation and why biometric requirements depend on the destination authority and visa route.", ["work visa biometrics", "visa biometrics Kenya", "biometric appointment jobs abroad"], ["What biometrics are", "When a government may require them", "Appointment and identity preparation", "Fees and official payment channels", "Privacy and document safety", "Follow-up after biometrics"]),
  globalTopic("verify-overseas-job-offer", "Safety & Compliance", "High", "How to Verify an Overseas Job Offer Before You Pay or Travel", "verify overseas job offer", "Fraud Awareness", "A step-by-step fraud-prevention guide for checking job offers, employers, contracts, recruiter channels, payment requests and visa claims.", ["verify overseas job offer", "fake job offer Kenya", "overseas recruitment scam", "job scam warning signs"], ["Check the employer identity", "Compare the offer with the published vacancy", "Review salary and contract terms", "Verify recruiter contact channels", "Check payment instructions", "Do not treat a visa promise as guaranteed"]),
  globalTopic("recruitment-scams-whatsapp", "Safety & Compliance", "High", "WhatsApp Recruitment Scams: How Job Seekers Can Protect Themselves", "WhatsApp job scam Kenya", "Fraud Awareness", "Practical warning signs for fake recruitment accounts, impersonation, urgent payment demands, fake documents and social-media job scams.", ["WhatsApp job scam Kenya", "recruitment scam WhatsApp", "fake recruitment agency Kenya", "jobs abroad scam"], ["Common impersonation tactics", "Urgent payment pressure", "Fake offer and visa documents", "How to verify an official channel", "Protect passwords and identity records", "How to report suspicious activity"]),
  globalTopic("recruitment-fees-explained", "Recruitment Education", "High", "International Recruitment Fees Explained: Service Charges, Third-Party Costs and Receipts", "international recruitment fees Kenya", "Payments & Fees", "A transparent guide to recruitment-service fees, document costs, medical providers, government charges, receipts and safe payment practices.", ["international recruitment fees Kenya", "overseas job fees", "recruitment agency fees Kenya", "job application fee Kenya"], ["Different types of recruitment-related costs", "Red Stone service charges", "Third-party medical and government charges", "Receipts and payment references", "Personal wallets and unsafe payment requests", "Refund and dispute channels"]),
  globalTopic("employment-contract-overseas", "Salary & Employment", "High", "How to Read an Overseas Employment Contract Before Accepting a Job", "overseas employment contract", "Employment Terms", "A candidate-friendly guide to reviewing job title, salary, working hours, benefits, probation, leave, deductions and termination terms in an overseas contract.", ["overseas employment contract", "international job contract", "job offer contract abroad", "employment terms overseas"], ["Job title and employer identity", "Salary and deductions", "Hours, overtime and leave", "Benefits and accommodation", "Probation and termination", "Questions to clarify before signing"]),
  globalTopic("salary-offer-overseas-job", "Salary & Employment", "Medium", "How to Evaluate an Overseas Job Salary and Benefits Package", "overseas job salary", "Salary & Employment Terms", "A practical framework for comparing salary offers, currencies, deductions, housing, meals, transport, insurance and total employment value.", ["overseas job salary", "international job benefits", "jobs abroad salary", "overseas employment package"], ["Gross salary versus take-home pay", "Currency and exchange-rate caution", "Housing, transport and meals", "Insurance and leave benefits", "Overtime and working hours", "Compare the written offer, not social-media claims"]),
  globalTopic("employer-sponsored-benefits", "Salary & Employment", "Medium", "Employer-Sponsored Benefits in Overseas Jobs: Visa, Flights, Housing and Insurance", "employer sponsored jobs benefits", "Sponsorship Guidance", "A guide to employer-paid benefits and why candidates must rely on the written offer or contract rather than assumptions about sponsorship.", ["employer sponsored jobs benefits", "visa flight accommodation jobs", "sponsored jobs abroad", "employer benefits overseas"], ["What employer-paid benefits can include", "Visa and work-permit costs", "Flights and travel", "Housing and meals", "Insurance and transport", "Why every benefit must be confirmed in writing"]),
  globalTopic("work-visa-vs-work-permit", "Visa & Work Permit", "High", "Work Visa vs Work Permit vs Residence Permit: Understanding the Difference", "work visa vs work permit", "Visa & Work Permit", "A simple explanation of three terms that are often confused in international recruitment and why each country uses its own immigration system.", ["work visa vs work permit", "residence permit vs work visa", "work authorization explained", "jobs abroad visa"], ["What a work visa is", "What a work permit is", "What a residence permit is", "Why countries use different systems", "Employer sponsorship and government approval", "Where candidates should verify current rules"]),
  globalTopic("visa-refusal-after-job-offer", "Visa & Work Permit", "Medium", "What Happens If a Work Visa Is Refused After a Job Offer?", "work visa refused after job offer", "Visa & Work Permit", "A responsible guide to separating employer selection from immigration approval, reviewing refusal reasons, preserving documents and using official appeal or reapplication channels where available.", ["work visa refused after job offer", "work visa refusal", "visa denied jobs abroad", "job offer visa refused"], ["Employer selection does not guarantee a visa", "Read the official refusal reason", "Check whether review or reapplication is available", "Communicate with the employer and recruiter", "Keep receipts and records", "Refund rules depend on the specific payment and service"]),
  globalTopic("pre-departure-checklist", "Recruitment Education", "High", "Overseas Job Pre-Departure Checklist: Documents, Travel and Employer Reporting", "overseas job pre departure checklist", "Pre-Departure", "A detailed final-stage checklist for candidates whose employer selection and required approvals are complete.", ["overseas job pre departure checklist", "travel checklist jobs abroad", "deployment checklist recruitment", "work abroad travel preparation"], ["Confirm approvals and employer reporting instructions", "Carry required travel documents", "Understand baggage and travel arrangements", "Emergency and employer contacts", "Money, phone and arrival planning", "What to do if travel details change"]),
  globalTopic("arrival-first-week-overseas-job", "Recruitment Education", "Medium", "Your First Week in an Overseas Job: Arrival, Employer Reporting and Settling In", "first week overseas job", "Pre-Departure", "Practical arrival guidance covering employer reporting, accommodation, documents, workplace induction, communication and where to ask for help.", ["first week overseas job", "arriving for work abroad", "overseas worker arrival", "international job onboarding"], ["Report to the correct employer contact", "Protect passport and important documents", "Accommodation and local orientation", "Workplace induction", "Understand pay and attendance systems", "Raise concerns through proper channels"]),
  globalTopic("recruitment-agency-verification", "Safety & Compliance", "High", "How to Check Whether a Recruitment Agency Is Legitimate Before Applying", "verify recruitment agency Kenya", "Fraud Awareness", "A candidate-protection guide to verifying the business identity, office, website, official contacts, contracts, receipts and job information of a recruitment provider.", ["verify recruitment agency Kenya", "legitimate recruitment agency Kenya", "recruitment agency scam", "overseas jobs agency Kenya"], ["Check the business and public identity", "Verify website and official email", "Confirm the vacancy and employer", "Review contracts and payment instructions", "Keep receipts and communication records", "Know how to report concerns"]),
  globalTopic("international-recruitment-employers", "Employer Guidance", "High", "International Recruitment for Employers: How to Source and Screen Overseas Talent Responsibly", "international recruitment for employers", "Employer Recruitment", "An employer-focused guide to workforce planning, vacancy definition, candidate sourcing, screening, interviews, documentation and ethical recruitment controls.", ["international recruitment for employers", "overseas recruitment agency employers", "hire foreign workers", "international talent recruitment"], ["Define the vacancy and candidate profile", "Source candidates through accountable channels", "Screen skills and documents", "Run structured interviews", "Coordinate work authorization responsibly", "Maintain transparent candidate communication"]),
  globalTopic("employer-job-description", "Employer Guidance", "Medium", "How Employers Should Write Clear International Job Descriptions", "international job description", "Employer Recruitment", "A practical guide for employers on writing accurate international vacancies with duties, qualifications, salary information, benefits and compliance requirements.", ["international job description", "write overseas job vacancy", "foreign worker job description", "international recruitment vacancy"], ["Use a precise job title", "Describe real duties", "Separate required and preferred qualifications", "State salary and benefits accurately", "Explain location, schedule and contract", "Avoid misleading sponsorship claims"]),
  globalTopic("candidate-data-privacy", "Safety & Compliance", "Medium", "Candidate Data Privacy in International Recruitment: Passports, CVs and Sensitive Documents", "candidate data privacy recruitment", "Data Protection", "A privacy-focused guide to minimizing document sharing, using official channels, protecting identity information and exercising data-protection rights.", ["candidate data privacy recruitment", "passport privacy recruitment", "job application data protection", "recruitment privacy Kenya"], ["What recruitment data can include", "Why passports and medical records need extra care", "Use official upload and communication channels", "Avoid unnecessary document copies", "Access, correction and deletion requests", "Report suspected misuse"]),
  globalTopic("refund-cancellation-recruitment", "Recruitment Education", "Medium", "Recruitment Refund and Cancellation Questions: What Candidates Should Check", "recruitment refund policy Kenya", "Payments & Fees", "A guide to understanding cancellation, service delivery, third-party costs, receipts and programme-specific written refund conditions.", ["recruitment refund policy Kenya", "job application refund", "recruitment cancellation", "overseas job refund"], ["Cancellation and refund are different", "Identify what payment was for", "Red Stone services versus third-party costs", "Keep receipts and written terms", "How to submit a refund request", "How complaints and disputes can be escalated"]),
  globalTopic("questions-before-paying-recruitment", "Safety & Compliance", "High", "10 Questions to Ask Before Paying Any Recruitment-Related Fee", "questions before paying recruitment fee", "Fraud Awareness", "A payment-safety checklist covering the service, official recipient, receipt, refund rules, employer details, vacancy evidence and what the payment does not guarantee.", ["questions before paying recruitment fee", "safe recruitment payment", "job fee scam Kenya", "overseas recruitment payment"], ["What exact service am I paying for?", "Who is the authorized recipient?", "Will I receive a receipt?", "Is the employer and vacancy identifiable?", "What is refundable and what is not?", "Does anyone claim the payment guarantees a job or visa?"]),
];

export const BLOG_STRATEGY_TOPICS: BlogStrategyTopic[] = [
  ...countries.flatMap((country) =>
    countryTemplates.map((template) => ({
      id: `${country.slug}-${template.key}`,
      country: country.name,
      countrySlug: country.slug,
      region: country.region,
      intent: template.intent,
      priority: template.priority,
      title: template.title(country.name),
      primaryKeyword: template.primaryKeyword(country.name),
      category: template.category(country.name),
      summary: template.summary(country.name),
      seoTitle: template.seoTitle(country.name),
      metaDescription: template.metaDescription(country.name),
      keywords: template.keywords(country.name),
      outline: template.outline(country.name),
    })),
  ),
  ...globalTopics,
];

export const BLOG_STRATEGY_COUNTRIES = countries;
export const BLOG_STRATEGY_INTENTS: BlogSearchIntent[] = [
  "Jobs",
  "Visa & Work Permit",
  "Documents",
  "Salary & Employment",
  "Applications & Interviews",
  "Safety & Compliance",
  "Recruitment Education",
  "Employer Guidance",
];

export function getBlogStrategyTopic(id: string) {
  return BLOG_STRATEGY_TOPICS.find((topic) => topic.id === id);
}

export function strategyDraftContent(topic: BlogStrategyTopic) {
  return topic.outline
    .map((heading, index) => `## ${heading}\n\n${index === 0 ? "Write a useful, original introduction based on the current vacancy market and verified sources." : "Add accurate, practical guidance here."}`)
    .join("\n\n");
}

function globalTopic(
  id: string,
  intent: BlogSearchIntent,
  priority: "High" | "Medium",
  title: string,
  primaryKeyword: string,
  category: string,
  summary: string,
  keywords: string[],
  outline: string[],
): BlogStrategyTopic {
  return {
    id,
    country: null,
    countrySlug: null,
    region: "Global",
    intent,
    priority,
    title,
    primaryKeyword,
    category,
    summary,
    seoTitle: title.length <= 65 ? title : title.replace(/:.*$/, ""),
    metaDescription: summary.length <= 175 ? summary : `${summary.slice(0, 171).trimEnd()}…`,
    keywords,
    outline,
  };
}
