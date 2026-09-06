import { CONTACT, RECRUITMENT_DISCLAIMER } from "./site";

export type CompanyPageSlug =
  | "about"
  | "mission-vision"
  | "why-red-stone"
  | "ethical-recruitment"
  | "candidate-protection"
  | "employer-services"
  | "recruitment-process"
  | "compliance"
  | "our-commitment"
  | "safety"
  | "official-channels";

export type CompanyPageContent = {
  slug: CompanyPageSlug;
  title: string;
  navTitle: string;
  eyebrow: string;
  description: string;
  intro: string;
  sections: { title: string; body: string }[];
  process?: string[];
  callouts?: { title: string; body: string }[];
};

export const companyPages: CompanyPageContent[] = [
  {
    slug: "about",
    title: "Professional, Responsible Recruitment Support",
    navTitle: "About Red Stone",
    eyebrow: "About Red Stone",
    description: "Learn who Red Stone Employment Agency is, what it does, and how it approaches responsible recruitment.",
    intro:
      "Red Stone Employment Agency supports candidates and employers through structured recruitment coordination, clear communication and careful handling of sensitive recruitment information.",
    sections: [
      { title: "Who We Are", body: "Red Stone is an employment agency focused on responsible recruitment support for candidates and employers. The agency helps organize recruitment information, vacancy communication, candidate preparation and employer coordination." },
      { title: "What We Do", body: "We support published vacancy workflows, candidate accounts, application tracking, document readiness, employer requests, interview coordination and recruitment administration." },
      { title: "Mission", body: "Our mission is to connect talent with legitimate employment opportunities through professional, transparent and responsible recruitment support." },
      { title: "Vision", body: "Our vision is to build a trusted recruitment experience where candidates and employers understand each stage, each responsibility and each decision boundary." },
      { title: "Our Values", body: "We emphasize transparency, professionalism, candidate dignity, employer service, privacy, clear communication and continuous improvement." },
      { title: "Recruitment Principles", body: "Vacancies should be reviewed before publication, applicants should use official channels, and no one should be told that employment, work permits or visas are guaranteed." },
      { title: "Candidates We Support", body: "We support candidates preparing for skilled, semi-skilled and entry-level opportunities where real vacancies are published and role requirements are clear." },
      { title: "Employers We Support", body: "We support employers with vacancy intake, candidate coordination, preliminary screening, interview support and recruitment administration without promising outcomes." },
      { title: "International Recruitment", body: "International recruitment involves employers, candidates, documents, contracts and government or immigration authorities. Red Stone coordinates support but does not control external decisions." },
      { title: "Technology and Recruitment", body: "The platform uses candidate, employer and admin portals to improve application tracking, document handling and recruitment-stage visibility." },
      { title: "Candidate Protection", body: "Candidates are encouraged to verify vacancies, protect documents, understand costs, avoid unofficial requests and report suspicious communication." },
      { title: "Trust and Transparency", body: "Public pages distinguish occupation categories from active vacancies. Apply actions attach to real published jobs only." },
      { title: "Our Commitment", body: "Red Stone aims to communicate clearly, protect sensitive information and keep recruitment processes structured and accountable." },
      { title: "Important Recruitment Disclaimer", body: RECRUITMENT_DISCLAIMER },
    ],
    process: ["Vacancy information", "Candidate preparation", "Application tracking", "Employer consideration", "Document review", "Selection where successful", "Authority procedures", "Pre-departure support"],
  },
  {
    slug: "mission-vision",
    title: "Mission, Vision and Direction",
    navTitle: "Mission & Vision",
    eyebrow: "Purpose",
    description: "Red Stone mission, vision, purpose and responsible recruitment direction.",
    intro:
      "Red Stone's direction is built around responsible international recruitment, practical candidate support and professional employer coordination.",
    sections: [
      { title: "Mission", body: "To support candidates and employers through structured, transparent and responsible recruitment coordination." },
      { title: "Vision", body: "To build a recruitment platform known for clarity, trust, careful communication and dignified treatment of candidates." },
      { title: "Purpose", body: "The purpose of the agency is to help people and employers navigate recruitment information, application stages and documentation requirements with less confusion." },
      { title: "Long-Term Direction", body: "Red Stone is building a stronger digital recruitment environment with real vacancy management, candidate portals, employer portals and staff review controls." },
      { title: "Candidate Commitment", body: "Candidates should receive clear role information, honest status updates where available and guidance to protect their accounts and documents." },
      { title: "Employer Commitment", body: "Employers should receive organized vacancy intake, candidate coordination and recruitment administration without unsupported claims about candidate availability." },
      { title: "Transparency Principles", body: "Published jobs, fees, requirements and process stages should be communicated carefully and updated when verified information changes." },
      { title: "Responsible Recruitment", body: "Responsible recruitment avoids guaranteed outcomes, misleading urgency and unclear payment or document requests." },
    ],
  },
  {
    slug: "why-red-stone",
    title: "Why Work With Red Stone",
    navTitle: "Why Red Stone",
    eyebrow: "Company approach",
    description: "Why candidates and employers use Red Stone for structured recruitment support.",
    intro:
      "Red Stone focuses on organized recruitment workflows, clear public vacancy information and safer communication for candidates and employers.",
    sections: [
      { title: "Structured Recruitment", body: "Vacancies, candidates, employers, applications and documents are handled through defined workflows instead of informal scattered communication." },
      { title: "Candidate Accounts", body: "Candidate accounts help applicants manage profile information, applications and documents through official access paths." },
      { title: "Application Tracking", body: "Application stages help staff coordinate review, employer consideration, interviews, documentation and deployment preparation." },
      { title: "Document Management", body: "Document workflows help keep sensitive records tied to the candidate and application where they belong." },
      { title: "Employer Coordination", body: "Employers can register, maintain company information and submit vacancy requests for Red Stone review." },
      { title: "Clear Vacancy Information", body: "Public jobs should show only vacancies published through the jobs table, not every occupation category in the catalogue." },
      { title: "Transparent Costs Where Applicable", body: "Country fee settings and job-level overrides support clearer programme cost communication where costs are configured and relevant." },
      { title: "Recruitment-Stage Visibility", body: "A structured status model makes internal review and candidate support easier to follow." },
      { title: "Responsible Communication", body: "Official channels are displayed publicly so candidates and employers can verify contact details." },
      { title: "Fraud Awareness", body: "Safety pages warn against impersonation, pressure tactics, unofficial payment requests and credential requests." },
      { title: "Support Channels", body: `Support is available through official Red Stone email at ${CONTACT.emails.support}.` },
    ],
  },
  {
    slug: "ethical-recruitment",
    title: "Ethical Recruitment Principles",
    navTitle: "Ethical Recruitment",
    eyebrow: "Recruitment standards",
    description: "How Red Stone communicates responsible recruitment boundaries and candidate protections.",
    intro:
      "Ethical recruitment starts with honest communication about what Red Stone can support and what remains outside the agency's control.",
    sections: [
      { title: "No Guaranteed Jobs", body: "Employment depends on vacancies, candidate suitability, employer selection and final contract terms. Red Stone does not guarantee a job." },
      { title: "No Guaranteed Visas or Work Permits", body: "Work permit, visa and immigration decisions are made by the relevant authorities, not by Red Stone." },
      { title: "Employer Decision Independence", body: "Employers make selection decisions based on their role requirements, interviews, documents and internal hiring standards." },
      { title: "Government Decision Independence", body: "Government and immigration authorities may request documents, conduct checks, approve, delay or reject applications." },
      { title: "Accurate Vacancy Information", body: "Published vacancies should be based on current authorization to recruit and should not be invented from catalogue titles." },
      { title: "Transparent Recruitment Stages", body: "Candidates should understand that each step is conditional and progression does not guarantee final employment." },
      { title: "Responsible Candidate Communication", body: "Communication should be clear, respectful and routed through official channels wherever possible." },
      { title: "Cost Transparency", body: "Where costs apply, candidates should receive clear written information and should question unofficial payment requests." },
      { title: "Candidate Dignity and Privacy", body: "Candidate records and documents should be handled carefully and used for recruitment-related purposes." },
      { title: "Reporting Concerns", body: `Concerns can be sent through the support channel at ${CONTACT.emails.support}.` },
    ],
  },
  {
    slug: "candidate-protection",
    title: "Candidate Protection Guide",
    navTitle: "Candidate Protection",
    eyebrow: "Candidate safety",
    description: "How candidates can protect themselves while using Red Stone recruitment services.",
    intro:
      "Candidates should take time to verify information, protect documents and use official Red Stone channels throughout the recruitment process.",
    sections: [
      { title: "Verify Vacancy Details", body: "Apply only for jobs visible on official Red Stone pages or confirmed through official Red Stone contact channels." },
      { title: "Understand Requirements", body: "Review role duties, experience, education, language, medical, document and location requirements before applying." },
      { title: "Understand Costs", body: "Ask for written cost information where costs apply and compare requests against official communication." },
      { title: "Protect Personal Documents", body: "Share sensitive documents only through trusted account or official channels and avoid sending records to unknown personal accounts." },
      { title: "Use Official Channels", body: `Use redstone.co.ke, ${CONTACT.emails.general}, ${CONTACT.emails.jobs} and the listed phone contacts for verification.` },
      { title: "Recognize Fraud", body: "Pressure to pay quickly, guaranteed visas, personal email addresses, password requests and unclear job details are warning signs." },
      { title: "Retain Receipts and Agreements", body: "Keep written records, receipts and agreements related to recruitment services or employer processes." },
      { title: "Review Employment Contracts", body: "Read contract details carefully before accepting an offer and ask questions where terms are unclear." },
      { title: "Understand Application Status", body: "An application status is a process marker, not a promise of selection, travel approval or final employment." },
      { title: "Report Suspicious Communication", body: `Report suspicious messages to ${CONTACT.emails.support} or through the complaints page.` },
    ],
  },
  {
    slug: "employer-services",
    title: "Employer Recruitment Services",
    navTitle: "Employer Services",
    eyebrow: "For employers",
    description: "Employer services including vacancy intake, screening, interview coordination and recruitment administration.",
    intro:
      "Red Stone supports employers with organized recruitment workflows while keeping vacancy publication and applicant communication responsible.",
    sections: [
      { title: "Vacancy Intake", body: "Employers can submit role information, location, requirements, salary status, benefits, deadlines and supporting notes for review." },
      { title: "Candidate Sourcing", body: "Red Stone may help identify candidates whose profiles align with published vacancy requirements." },
      { title: "Preliminary Screening", body: "Candidate information can be checked for completeness, consistency and relevance before employer consideration." },
      { title: "Candidate Coordination", body: "Communication support helps candidates understand next steps, document requests and interview arrangements." },
      { title: "Document Readiness", body: "Recruitment teams can help coordinate common document readiness checks without guaranteeing authority acceptance." },
      { title: "Interview Coordination", body: "Employers can request interviews and Red Stone can help coordinate scheduling and communication." },
      { title: "Recruitment Administration", body: "Administrative support helps keep vacancy, application and review records organized." },
      { title: "Employer Portal", body: "The employer portal supports company profiles, vacancy requests, applicant review and interview-related workflows." },
      { title: "Applicant Review", body: "Employers may review applicants for their company jobs while internal staff notes remain protected." },
      { title: "Responsible International Hiring", body: "International hiring should be realistic about selection, documentation, contracts, work authorization and timelines." },
    ],
    callouts: [
      { title: "No Outcome Promise", body: "Red Stone does not promise candidate availability, employer selection, work authorization or recruitment outcomes." },
    ],
  },
  {
    slug: "recruitment-process",
    title: "Recruitment Process",
    navTitle: "Recruitment Process",
    eyebrow: "Process visibility",
    description: "A practical overview of the Red Stone recruitment process from vacancy preparation to deployment.",
    intro:
      "The recruitment process is staged so candidates and employers can understand what happens before, during and after application review.",
    sections: [
      { title: "Progression Is Conditional", body: "Candidates may exit the process at any stage. Progression does not guarantee final employment, work permits, visas or immigration approval." },
      { title: "Published Vacancies Only", body: "Applications attach to real published job records, while occupation catalogue entries remain suggestions and categories." },
      { title: "Status Communication", body: "Status updates help organize review, but final decisions depend on employers, documents, contracts and relevant authorities." },
    ],
    process: [
      "Vacancy preparation",
      "Vacancy review",
      "Publication",
      "Candidate application",
      "Preliminary screening",
      "Document review",
      "Employer consideration",
      "Interview where applicable",
      "Employment offer or contract where successful",
      "Work permit or visa procedures",
      "Pre-departure preparation",
      "Deployment",
    ],
  },
  {
    slug: "compliance",
    title: "Compliance and Responsible Operations",
    navTitle: "Compliance",
    eyebrow: "Operational care",
    description: "Responsible recruitment, privacy, document handling, role-based access and complaints information.",
    intro:
      "Compliance information on this website is provided to explain responsible operating principles, not to claim unverified registrations or accreditations.",
    sections: [
      { title: "Responsible Recruitment", body: "Recruitment communication should avoid unsupported guarantees and should present vacancy information carefully." },
      { title: "Privacy", body: "Candidate, employer and application information should be handled according to recruitment purposes and privacy expectations." },
      { title: "Document Handling", body: "Sensitive records should be tied to candidate and application workflows and shared only where appropriate." },
      { title: "Role-Based Access", body: "Admin, staff, candidate and employer portal areas use role-based access patterns to reduce unnecessary data exposure." },
      { title: "Employer Verification", body: "Employer accounts and company details are reviewed before sensitive employer workflows should be trusted." },
      { title: "Vacancy Review", body: "Vacancies should be checked before publication so public applicants see current, authorized opportunities." },
      { title: "Candidate Consent", body: "Candidates should understand what information they submit and should use official account and application paths." },
      { title: "Record Keeping", body: "Recruitment records, audit logs and status history support accountability and operational traceability." },
      { title: "Complaints", body: "Complaints give candidates and employers a route to report concerns about communication, conduct or process." },
      { title: "Fraud Reporting", body: "Suspicious messages, impersonation and unofficial payment or credential requests should be reported." },
    ],
  },
  {
    slug: "our-commitment",
    title: "Our Commitment",
    navTitle: "Our Commitment",
    eyebrow: "Commitments",
    description: "Red Stone commitments to transparency, professionalism, candidate care, privacy and clear communication.",
    intro:
      "Red Stone's public commitments describe how the agency aims to support recruitment work with care and consistency.",
    sections: [
      { title: "Transparency", body: "We aim to explain vacancy details, recruitment stages, costs where applicable and decision boundaries clearly." },
      { title: "Professionalism", body: "We aim to keep communication respectful, organized and aligned with official recruitment workflows." },
      { title: "Candidate Care", body: "We aim to treat candidates with dignity and help them understand applications, documents and safety expectations." },
      { title: "Responsible Recruitment", body: "We avoid guaranteed-outcome claims and encourage realistic expectations throughout the process." },
      { title: "Employer Service", body: "We aim to help employers present role requirements clearly and review candidates through structured channels." },
      { title: "Privacy", body: "We aim to protect sensitive account, profile, application and document information." },
      { title: "Continuous Improvement", body: "We aim to improve digital workflows, content clarity, staff coordination and support resources over time." },
      { title: "Clear Communication", body: "We aim to maintain official channels that candidates and employers can verify before acting." },
    ],
  },
  {
    slug: "safety",
    title: "Safety and Fraud Prevention",
    navTitle: "Safety",
    eyebrow: "Safety",
    description: "Safety guidance for avoiding recruitment fraud and protecting account credentials.",
    intro:
      "Safety starts with verifying the channel, questioning pressure tactics and protecting sensitive account and document information.",
    sections: [
      { title: "Distrust Unofficial Payment Requests", body: "Do not act on payment requests sent through unofficial personal accounts or pressure messages. Ask Red Stone to verify the request through official channels." },
      { title: "Never Share Passwords or OTPs", body: "Red Stone will not ask candidates or employers to share passwords, one-time passwords or sensitive account credentials." },
      { title: "Check the Website", body: "The official public website is redstone.co.ke. Treat lookalike domains and copied social pages with caution." },
      { title: "Check Email Domains", body: "Official Red Stone emails use @redstone.co.ke. Unusual requests should still be verified directly." },
      { title: "Protect Documents", body: "Sensitive records should be uploaded or shared only through trusted and verified channels." },
      { title: "Report Suspicion", body: `Suspicious communication can be reported to ${CONTACT.emails.support}.` },
    ],
    callouts: [
      { title: "Official phone verification", body: CONTACT.phones.join(" / ") },
      { title: "Support email", body: CONTACT.emails.support },
    ],
  },
  {
    slug: "official-channels",
    title: "Official Red Stone Channels",
    navTitle: "Official Channels",
    eyebrow: "Verification",
    description: "Official Red Stone contact details and verification guidance.",
    intro:
      "Use this page to verify Red Stone contact details before sharing documents, acting on payment instructions or responding to sensitive requests.",
    sections: [
      { title: "Official Website", body: "The official website is redstone.co.ke." },
      { title: "General Enquiries", body: CONTACT.emails.general },
      { title: "Jobs, Recruitment and Employers", body: CONTACT.emails.jobs },
      { title: "Candidate Support, Documents, Accounts and Complaints", body: CONTACT.emails.support },
      { title: "Staff and HR", body: CONTACT.emails.hr },
      { title: "Visa and Document Processing", body: CONTACT.emails.visa },
      { title: "Administrative Communication", body: CONTACT.emails.admin },
      { title: "Phone", body: CONTACT.phones.join(" / ") },
      { title: "Credential Safety", body: "Do not share passwords, OTPs or account recovery codes with anyone claiming to represent Red Stone." },
      { title: "Payment Safety", body: "Question requests that come from unofficial contacts, lack written context or pressure you to act immediately." },
    ],
  },
];

export const trustNavigation = companyPages.map((page) => ({
  label: page.navTitle,
  href: `/${page.slug}`,
}));

export function getCompanyPage(slug: CompanyPageSlug) {
  const page = companyPages.find((item) => item.slug === slug);

  if (!page) {
    throw new Error(`Unknown company page: ${slug}`);
  }

  return page;
}
