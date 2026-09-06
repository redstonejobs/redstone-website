export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqCategory = {
  slug: string;
  name: string;
  description: string;
  keywords: string[];
  relatedHref: string;
  relatedLabel: string;
  faqs: FaqItem[];
};

type Topic = {
  label: string;
  overview: string;
  stage: string;
  documents: string;
  redStoneRole: string;
  caution: string;
  nextStep: string;
};

type CategorySeed = Omit<FaqCategory, "faqs"> & { topics: Topic[] };

const seeds: CategorySeed[] = [
  {
    slug: "recruitment-basics",
    name: "Recruitment Basics",
    description:
      "Understand how international recruitment works at Red Stone, from registration and job matching to employer selection and case timelines.",
    keywords: ["international recruitment process", "job matching", "employer selection", "recruitment timeline", "candidate status"],
    relatedHref: "/how-it-works",
    relatedLabel: "How Recruitment Works",
    topics: [
      topic(
        "international recruitment process",
        "International recruitment is a staged process that connects a candidate to a genuine vacancy, employer review and, where relevant, later compliance and immigration steps.",
        "from registration through employer selection and post-selection preparation",
        "a candidate profile, CV, identity information and any vacancy-specific evidence requested at the relevant stage",
        "Red Stone organizes the candidate journey, explains the current stage and coordinates recruitment information without making the employer's hiring decision",
        "Registration or profile review is not a guaranteed job offer, sponsorship decision or visa approval.",
        "review published vacancies, keep your profile accurate and follow the instructions shown in your application"
      ),
      topic(
        "job matching",
        "Job matching compares a candidate's experience, skills, availability and documents with the actual requirements of a published or employer-approved role.",
        "after a usable candidate profile exists and before an employer makes a final selection",
        "an up-to-date CV, accurate work history, skills, licences where relevant and truthful availability information",
        "Red Stone can shortlist or route suitable profiles toward relevant opportunities based on the employer's stated requirements",
        "Matching does not mean the employer has selected you, and candidates should not exaggerate experience to fit a role.",
        "apply only for roles you can genuinely perform and keep supporting documents ready"
      ),
      topic(
        "employer selection",
        "Employer selection is the point at which the hiring organization decides which shortlisted candidates it wants to interview, progress or hire.",
        "after sourcing and screening and before most post-selection medical, work-permit or deployment steps",
        "your CV, interview information, references or supporting evidence requested by the employer, plus any role-specific licences",
        "Red Stone coordinates communication and interview administration, but the employer controls the final hiring decision",
        "Never rely on verbal promises alone; important employment terms should be confirmed in a written offer or contract.",
        "respond promptly to interview requests and review written terms before moving to later stages"
      ),
      topic(
        "application status",
        "Application status shows where a candidate is within the Red Stone workflow, such as draft, review, payment preparation, employer consideration or a later post-selection stage.",
        "throughout the application lifecycle whenever the candidate needs to understand what action is currently required",
        "the application reference, correct contact details and any records requested for the current status",
        "Red Stone uses structured status information to keep applications organized and to avoid asking candidates to complete later steps too early",
        "A status change is not the same as visa approval, employer selection or travel authorization unless that requirement has actually been completed.",
        "check your candidate account and official Red Stone messages before taking the next action"
      ),
      topic(
        "recruitment timelines",
        "Recruitment timelines vary because vacancies, employer interviews, document checks, medical appointments and government procedures do not move at the same speed.",
        "from the first application until the candidate either exits the process or reaches deployment",
        "timely documents, reachable contact details, interview availability and any official appointments or reference numbers",
        "Red Stone can explain known stages and outstanding actions but cannot control employer or government decision times",
        "Be cautious of anyone promising an exact job, visa or travel date before the responsible employer or authority has completed its part.",
        "complete your own requirements quickly and use official updates rather than assumptions about timing"
      ),
    ],
  },
  {
    slug: "applications",
    name: "Applications & Candidate Accounts",
    description:
      "Detailed guidance on starting, completing, reviewing and managing a Red Stone candidate application.",
    keywords: ["job application", "candidate account", "passport application details", "document upload", "application review"],
    relatedHref: "/apply",
    relatedLabel: "Start Application",
    topics: [
      topic(
        "creating a candidate application",
        "A Red Stone candidate application creates the structured record used to collect the basic information needed for recruitment and later processing.",
        "at the beginning of the candidate journey before employer matching can be completed",
        "legal name, date of birth, nationality, contact details and the job or opportunity being pursued",
        "Red Stone uses the application record to organize candidate information and connect later documents, payments and recruitment actions to the correct person",
        "Use your real legal identity and avoid creating duplicate or conflicting applications for the same case.",
        "start from a genuine published vacancy or the approved application route and complete the required sections carefully"
      ),
      topic(
        "personal information",
        "Personal information identifies the applicant and provides the contact and residence details needed to manage the recruitment case accurately.",
        "during the initial application stage and whenever official records must be matched to the correct candidate",
        "legal names, date of birth, nationality, country of residence, phone number, email address and any other required identity fields",
        "Red Stone stores the information for recruitment administration and uses it to reduce identity mismatches across documents",
        "Names and dates should match your passport or official identity records; inconsistent details can delay later checks.",
        "review every personal field before submitting and update official contact information if it changes"
      ),
      topic(
        "passport information",
        "Passport information connects the candidate's recruitment record to the travel document commonly required for international employment and immigration processing.",
        "before post-selection immigration or travel steps and usually during the core application",
        "passport number, issuing country, issue date, expiry date and a clear copy when requested",
        "Red Stone records passport information for recruitment-document readiness and later case coordination where lawful and necessary",
        "Do not upload an altered passport, and make sure the passport will remain valid for the period required by the destination.",
        "enter passport details exactly as printed and renew an expiring passport early when practical"
      ),
      topic(
        "document uploads",
        "Document uploads provide supporting evidence for the candidate's identity, CV, qualifications, conduct or other role-specific requirements.",
        "after the basic application information is complete and whenever the vacancy or later stage requires supporting evidence",
        "CV, passport copy, national ID where relevant, good-conduct record, certificates, licences and other specifically requested documents",
        "Red Stone uses uploaded records for application review, document verification and employer or compliance preparation where appropriate",
        "Upload only genuine, readable documents and avoid sending unnecessary sensitive files that were not requested.",
        "use the candidate portal or official Red Stone channel specified for the document and keep your own copy"
      ),
      topic(
        "application review and readiness",
        "Application review checks whether the required candidate information and documents are sufficiently complete to move to the next stage.",
        "after the candidate has completed the core sections and before payment or employer-processing steps that depend on readiness",
        "completed personal and passport details, required declarations and the supporting documents requested for the case",
        "Red Stone's workflow checks readiness so candidates are not sent to later stages while important information is still missing",
        "A review-ready application is not a guarantee of employer selection, sponsorship or visa approval.",
        "correct any missing information shown in the application and proceed only when the system indicates the next stage is available"
      ),
    ],
  },
  {
    slug: "sponsorship",
    name: "Sponsorship Jobs & Employer Benefits",
    description:
      "Questions about Red Stone sponsorship pathways, eligibility, employer-funded benefits, medical booking and programme intake rules.",
    keywords: ["visa sponsorship jobs", "employer sponsored jobs", "sponsorship benefits", "sponsorship medical", "sponsorship eligibility"],
    relatedHref: "/sponsorship-jobs",
    relatedLabel: "Sponsorship Jobs",
    topics: [
      topic(
        "employer-sponsored placement",
        "An employer-sponsored placement is a recruitment pathway in which an employer supports an eligible worker for the work-authorization process required by the destination, subject to the law and the written offer.",
        "after a suitable vacancy exists and the employer chooses to progress the candidate",
        "candidate application, CV, passport, employer offer or selection records and the destination-specific evidence requested later",
        "Red Stone can support sourcing, screening, document preparation and process coordination, while the employer and government authorities control sponsorship and immigration decisions",
        "Submitting an application does not itself create sponsorship, employment or a visa entitlement.",
        "review the sponsorship role, apply through Red Stone and wait for documented employer selection before treating the case as sponsored"
      ),
      topic(
        "sponsored benefits",
        "Sponsored benefits are employer-funded items that may be included in a qualifying written employment package, such as visa or work-authorization costs, economy air ticket, accommodation, food support, insurance or onboarding.",
        "after the employer has defined the employment package and the candidate is being considered or selected",
        "the written offer or contract showing the actual salary, benefits, responsibilities and any conditions attached to those benefits",
        "Red Stone presents sponsorship benefits as conditional on the individual employer offer rather than as automatic promises for every applicant",
        "Do not assume every benefit shown on a general sponsorship page applies to every employer or country; the signed offer controls the actual package.",
        "read the written offer carefully and ask for clarification before paying for candidate-owned compliance requirements"
      ),
      topic(
        "sponsorship eligibility",
        "Sponsorship eligibility depends on the vacancy, employer, destination rules, candidate experience, documents, health or conduct requirements where lawful, and the availability of a valid immigration route.",
        "during screening and employer selection and again when the official work-authorization route is assessed",
        "truthful work history, passport, qualifications or licences for the role, conduct records where required and any destination-specific evidence",
        "Red Stone can compare the candidate profile with known recruitment requirements and explain the process, but cannot override an employer or government eligibility rule",
        "No recruiter can lawfully guarantee eligibility before the employer and relevant authority have assessed the applicable requirements.",
        "apply for roles that match your real background and complete every requested stage honestly"
      ),
      topic(
        "sponsorship medical booking",
        "For the Red Stone sponsorship programme, the programme medical is arranged or authorized through the application process when the candidate reaches the correct stage, while any government rule requiring a particular approved provider takes priority.",
        "after the case has progressed far enough for a medical to be relevant rather than at the first job-search stage",
        "passport or identification, application reference, appointment instructions and any records specifically required by the approved medical provider",
        "Red Stone coordinates the programme booking stage so the correct medical route is used for the candidate's destination and case",
        "Do not arrange an unnecessary or unofficial programme medical on the assumption that it will create sponsorship; official panel-physician rules must always be followed.",
        "wait for the medical instruction in your Red Stone case and use the designated or officially required provider"
      ),
      topic(
        "sponsorship intake deadlines",
        "A sponsorship intake deadline is the closing date for a published Red Stone candidate-intake window, not a guarantee that every employer vacancy remains available until that exact time.",
        "while the published programme intake is open and candidates are deciding whether to submit an application",
        "a complete application and the documents needed to be considered before the intake closes",
        "Red Stone uses intake dates to organize recruitment campaigns and candidate processing for the advertised period",
        "Vacancies can fill, employer requirements can change, and government rules can change before the intake deadline.",
        "apply early enough to complete the required stages and continue checking the role and case status"
      ),
    ],
  },
  {
    slug: "documents",
    name: "Documents, CVs & Verification",
    description:
      "Detailed answers about CVs, passports, police clearance, certificates, references and document verification.",
    keywords: ["CV verification", "passport requirements", "police clearance", "employment certificates", "job references"],
    relatedHref: "/candidate-support",
    relatedLabel: "Candidate Support",
    topics: [
      topic(
        "CV or resume",
        "A CV or resume summarizes the candidate's genuine employment history, skills, education and relevant achievements so employers can assess suitability for a vacancy.",
        "before job matching, employer shortlisting and interview preparation",
        "accurate job dates, employer names, responsibilities, education, licences where relevant and current contact information",
        "Red Stone can review the CV for clarity and consistency with the application and supporting documents",
        "Never invent job experience, qualifications or duties simply to match a vacancy; inconsistencies can damage credibility and later verification.",
        "keep the CV current, concise and aligned with the evidence you can genuinely support"
      ),
      topic(
        "passport",
        "A valid passport is the primary international travel and identity document used in many work-authorization, visa and deployment processes.",
        "during application readiness and especially before immigration, medical or travel stages",
        "a valid passport with correct biographical details and, when requested, a clear copy of the identity page",
        "Red Stone uses passport details to support identity consistency and later recruitment coordination where necessary",
        "An expired, damaged or altered passport can delay or prevent later processing, and passport requirements differ by destination.",
        "check validity early and ensure your application uses exactly the same legal name and date of birth"
      ),
      topic(
        "police clearance or certificate of good conduct",
        "Police clearance or a certificate of good conduct may be requested by an employer or government authority to assess criminal-record requirements for a particular job or immigration route.",
        "usually at a later recruitment, compliance or immigration stage when the employer or destination actually requires it",
        "the official certificate, application reference or receipt, identity documents and any country-specific authentication requested by the authority",
        "Red Stone can tell candidates when the recruitment case requires a conduct record and help organize it with the rest of the file",
        "Do not buy unofficial clearance documents or alter dates; validity periods and accepted issuing authorities can be strict.",
        "obtain the record from the proper authority when requested and keep both the original and a secure copy"
      ),
      topic(
        "certificates and professional licences",
        "Certificates and licences demonstrate education, training, trade competence or legal permission to practise a regulated occupation where the role requires it.",
        "during screening for skilled or regulated jobs and before employer or licensing approval",
        "original or verifiable academic certificates, trade certificates, registration or licence details and translations or authentication where officially required",
        "Red Stone can identify when a vacancy requires specific credentials and help the candidate organize supporting records",
        "A certificate alone does not guarantee recognition in another country; some destinations require separate licensing, equivalency or registration.",
        "verify the role's credential requirements and begin any official recognition process early"
      ),
      topic(
        "employment references",
        "Employment references help an employer confirm that the candidate worked in the stated role and can provide credible information about responsibilities, conduct or performance.",
        "during screening, background verification or after a conditional employer selection",
        "referee name, organization, role, reliable contact information and any written reference requested by the employer",
        "Red Stone may coordinate reference information as part of candidate verification or employer due diligence",
        "Do not use fake referees or ask someone to confirm experience that did not occur; employers may independently verify the information.",
        "ask legitimate former employers or supervisors for permission before listing them and keep their contact details current"
      ),
    ],
  },
  {
    slug: "medicals-compliance",
    name: "Medicals, Biometrics & Compliance",
    description:
      "Deep guidance on Gulf and non-Gulf medicals, IOM routes, biometrics and compliance checks in the Red Stone recruitment process.",
    keywords: ["Gulf medical", "IOM medical", "biometrics", "medical compliance", "immigration medical"],
    relatedHref: "/medicals-compliance",
    relatedLabel: "Medicals & Compliance",
    topics: [
      topic(
        "Gulf programme medical",
        "The Red Stone sponsorship programme currently lists KES 12,500 for the applicable Gulf medical route, subject to the destination's official requirements and approved-provider rules.",
        "when a Gulf sponsorship case reaches the medical stage after the relevant recruitment progression",
        "passport or identity document, case or appointment information and any additional records required by the approved medical provider",
        "Red Stone initiates or authorizes the programme booking through the application process so the candidate follows the intended route",
        "The KES 12,500 figure is not a job fee and does not guarantee medical fitness, employer selection, visa approval or entry.",
        "wait for the Red Stone medical instruction and follow any government-mandated approved medical system"
      ),
      topic(
        "non-Gulf programme medical",
        "The Red Stone sponsorship programme currently lists KES 31,060 for qualifying non-Gulf medical cases where that medical route applies.",
        "after a non-Gulf case reaches the stage at which an employment or immigration medical is genuinely required",
        "passport or identity document, Red Stone case details, appointment information and any records requested by the medical provider",
        "Red Stone coordinates or authorizes the programme booking when the case is ready, while the destination authority determines which medical provider and tests are legally acceptable",
        "Do not assume the same medical is valid for every country; some governments require a different panel physician, form or examination.",
        "follow the specific instruction for your case and retain the official receipt and appointment evidence"
      ),
      topic(
        "IOM medical route",
        "The Red Stone sponsorship information currently lists KES 41,000 for an IOM medical route where IOM or that approved pathway is appropriate or required for the candidate's case.",
        "only when the destination, employer or official process calls for that route",
        "passport, appointment or case reference and the documents specified by IOM or the relevant official medical instructions",
        "Red Stone can coordinate the candidate's recruitment-side preparation, while IOM or the authorized medical provider conducts the medical assessment",
        "The amount and required tests can change, and a medical result is not a visa decision; the relevant authority applies the immigration rules.",
        "use the official booking and payment instructions for the applicable IOM or authority process"
      ),
      topic(
        "biometrics",
        "Biometrics usually involve government collection of fingerprints, photographs or other identity information for an immigration or identity-verification process.",
        "after the relevant visa, permit or government application reaches the biometric requirement",
        "passport, official biometric instruction or appointment notice, application reference and any required payment confirmation",
        "Red Stone can help candidates understand when biometrics fit into the wider recruitment case, but the authorized government or service centre collects and controls the biometric process",
        "Never give biometric data to an unofficial person or location claiming to speed up a visa.",
        "follow the official appointment notice and keep the confirmation or receipt for your records"
      ),
      topic(
        "compliance verification",
        "Compliance verification checks whether the candidate and case have the identity, conduct, medical, document or occupation-specific requirements needed for the next lawful stage.",
        "after employer selection or whenever the role and destination require formal verification",
        "the specific records requested for the case, which can include passport, good conduct, medical results, qualifications, licences or employer documents",
        "Red Stone helps organize the recruitment file and identify outstanding requirements without replacing the government, medical or licensing authority",
        "Requirements differ by country and occupation, so a checklist from another candidate may not apply to your case.",
        "use the checklist issued for your own case and verify official requirements before submitting sensitive documents"
      ),
    ],
  },
  {
    slug: "payments-fees",
    name: "Payments, Fees & Receipts",
    description:
      "Understand the KES 2,000 application verification fee, medical charges, receipts, safe payment practices and what candidates should never pay for.",
    keywords: ["KES 2000 application fee", "document verification fee", "medical fees", "recruitment payment", "payment receipt"],
    relatedHref: "/sponsorship-jobs",
    relatedLabel: "Sponsorship Payment Details",
    topics: [
      topic(
        "KES 2,000 CV and Document Verification Fee",
        "The Red Stone application workflow includes a KES 2,000 fee for CV review, document verification, application-record preparation and submission processing at the payment stage.",
        "only after the application reaches the appropriate review or payment-ready stage",
        "the application reference, correct mobile-payment details and acknowledgement of the fee purpose",
        "Red Stone's payment workflow links the payment to the candidate application and records the transaction status",
        "This is not payment for employment, sponsorship, a visa, work permit or guaranteed placement.",
        "complete the application first and pay only through the official payment flow shown in your Red Stone case"
      ),
      topic(
        "medical payments",
        "Medical charges are candidate-owned compliance costs only when the applicable recruitment or immigration process actually requires that medical route.",
        "after Red Stone or the relevant authority confirms that the medical stage is due",
        "official appointment or booking details, identification and the approved provider's payment instructions or receipt",
        "Red Stone coordinates programme medical booking where applicable but does not convert a medical payment into a job or visa guarantee",
        "Never pay a medical fee to an unofficial personal number or assume a medical is necessary simply because someone sends you a message.",
        "use the designated hospital, IOM or officially approved provider instructions for your case and keep the receipt"
      ),
      topic(
        "official receipts",
        "A receipt provides evidence that a legitimate payment was made for a specific application, medical, government or service transaction.",
        "immediately after any authorized payment connected to the case",
        "transaction reference, date, amount, payer information and the official provider or Red Stone payment record",
        "Red Stone uses payment records to reconcile application stages and help investigate payment questions",
        "A screenshot of a chat or an unverified handwritten note is not the same as an official transaction record.",
        "save the M-Pesa, bank, provider or system receipt and quote the reference when contacting support"
      ),
      topic(
        "refund questions",
        "Whether a payment is refundable depends on the type of charge, the work already completed, the provider involved and the applicable Red Stone refund or cancellation terms.",
        "when a candidate cancels, a service cannot continue or a payment dispute arises",
        "payment reference, application ID, reason for the request and any supporting correspondence or provider evidence",
        "Red Stone can review eligible requests under its published refund and cancellation policy once that policy applies to the payment involved",
        "Government, medical-provider, airline or third-party charges may follow separate refund rules, and completed verification work may not be fully refundable.",
        "use the official complaints or support channel with the payment reference rather than requesting a refund through an unofficial contact"
      ),
      topic(
        "recruitment payment scams",
        "A recruitment payment scam is any request that misrepresents money as a guaranteed way to buy a job, visa, sponsorship, interview outcome or employer selection.",
        "at any stage where someone asks for money outside the documented Red Stone or official provider process",
        "the suspicious message, phone number, payment request, account details and any transaction evidence if money was already sent",
        "Red Stone publishes official payment purposes and channels so candidates can distinguish legitimate processing costs from unauthorized demands",
        "Do not send money to personal accounts or unknown numbers promising guaranteed placement, and do not share one-time passwords or payment PINs.",
        "stop the transaction, verify through official Red Stone contacts and report the suspicious request"
      ),
    ],
  },
  {
    slug: "visas-work-permits",
    name: "Visas, Work Permits & Residence",
    description:
      "Detailed explanations of work visas, work permits, residence permits, visitor or student status and government decision-making.",
    keywords: ["work visa", "work permit", "residence permit", "visitor visa work", "visa approval"],
    relatedHref: "/visa-process",
    relatedLabel: "26 Visa Guides",
    topics: [
      topic(
        "work visa",
        "A work visa is an immigration authorization used by some countries to allow an eligible foreign national to enter or remain for employment under a specified route.",
        "after the candidate has the employer, sponsorship, skills or other eligibility required by the country's work route",
        "passport, forms, employer or sponsor documents, qualifications, financial or conduct evidence and any medical or biometric records required by the authority",
        "Red Stone can support recruitment and document preparation, but the government authority receives and decides the visa application",
        "A job application, employer interest or recruitment payment is not the same as a work visa approval.",
        "use the country-specific visa guide and official authority link before submitting any immigration application"
      ),
      topic(
        "work permit",
        "A work permit is formal permission to work that may be issued separately from a visa or residence document depending on the country's immigration system.",
        "once the employer and worker satisfy the legal route for employment and before work begins where a permit is required",
        "employer sponsorship or labour approval, passport, contract, qualifications and the records specified by the labour or immigration authority",
        "Red Stone helps candidates understand the sequence between employer selection, work authorization and travel",
        "Do not assume a visitor visa or entry stamp gives permission to work; the correct work authorization must exist where required.",
        "confirm the exact permit route for the destination and wait for official approval before starting employment"
      ),
      topic(
        "residence permit",
        "A residence permit allows a foreign national to live in a country for a defined purpose such as work, study or family residence and may be issued before or after entry depending on the system.",
        "after the person qualifies under the country's residence rules and sometimes after arrival",
        "passport, visa or entry authorization where needed, work or study basis, address or insurance evidence and other country-specific records",
        "Red Stone can explain recruitment-related residence steps for workers but does not issue residence status",
        "Residence requirements can continue after arrival, including registration, card collection or renewal obligations.",
        "follow the country guide and complete any post-arrival residence formalities by the official deadlines"
      ),
      topic(
        "visitor or student status versus work",
        "Visitor and student routes are designed for specific purposes and should not automatically be treated as permission to take ordinary employment.",
        "whenever a candidate is considering travelling before obtaining the proper employment authorization",
        "the official visa conditions, admission or visitor records and any separate work authorization if the rules allow limited work",
        "Red Stone separates recruitment guidance from immigration status so candidates do not confuse a travel visa with legal work permission",
        "Working outside the conditions of a visitor or student status can create serious immigration and employment consequences.",
        "check the official conditions of your current status and obtain the correct work authorization before accepting employment"
      ),
      topic(
        "visa and permit decisions",
        "Visa, work-permit and residence decisions are made by the competent government authority under the law and evidence applicable to the individual case.",
        "after a complete official application has been submitted and any biometrics, medicals, interviews or requests for evidence have been completed",
        "the full official application record and any additional information the government asks for",
        "Red Stone can prepare and coordinate recruitment documents but cannot approve, accelerate or guarantee a government decision",
        "Be cautious of anyone who claims they can privately guarantee approval or bypass official requirements.",
        "use official tracking channels and wait for the written government decision before making irreversible travel plans"
      ),
    ],
  },
  {
    slug: "countries-destinations",
    name: "Countries, Destinations & Eligibility",
    description:
      "Questions about choosing among Red Stone's 26 destinations, country-specific requirements, salaries, languages, licensing and processing times.",
    keywords: ["work abroad countries", "country eligibility", "salary abroad", "language requirements", "work visa processing time"],
    relatedHref: "/countries",
    relatedLabel: "Explore Countries",
    topics: [
      topic(
        "choosing a destination",
        "Choosing a recruitment destination should be based on genuine vacancies, your skills, language, licensing needs, legal eligibility, expected living conditions and the employer's actual offer.",
        "before applying broadly across countries or committing money to destination-specific documents",
        "your CV, passport, qualifications, preferred role, language ability, family considerations and any professional licensing information",
        "Red Stone provides country and job guidance so candidates can compare destinations based on the recruitment pathway rather than marketing promises",
        "A popular country is not automatically the best or easiest option for every candidate.",
        "compare published jobs and country guidance and apply where your real profile matches the opportunity"
      ),
      topic(
        "country-specific requirements",
        "Every destination can impose different rules for work authorization, medicals, biometrics, police clearance, qualifications, salary thresholds and employer sponsorship.",
        "after choosing a country and again whenever the case moves into an official immigration or compliance stage",
        "the records listed by the employer and current government authority for that specific route",
        "Red Stone organizes destination guidance and links candidates to the relevant country process, while official rules remain controlling",
        "Do not reuse another country's checklist or an old social-media post as if it were current official guidance.",
        "open the country and visa guide for your destination and verify the latest authority instructions"
      ),
      topic(
        "salary and currency",
        "Salary should be read in the employer's stated currency and in the context of working hours, overtime, accommodation, food, taxes, deductions and local living costs.",
        "when comparing vacancies and again before accepting a written offer",
        "the job advertisement, written offer or contract and any legally required wage information",
        "Red Stone aims to present realistic salary information and avoids treating indicative ranges as guaranteed pay",
        "A high headline salary can be misleading if hours, deductions or benefits are not understood, and exchange rates change.",
        "compare the full compensation package and rely on the signed employer terms for the final amount"
      ),
      topic(
        "language and professional licensing",
        "Some jobs require a particular language level, trade licence, professional registration or recognition of foreign qualifications before the worker can legally perform the role.",
        "during job screening for regulated or customer-facing roles and before deployment where licensing is mandatory",
        "language results where required, certificates, transcripts, professional registration, trade licences or equivalency evidence",
        "Red Stone can identify vacancy requirements and direct candidates to prepare the relevant credentials",
        "Recruitment approval does not replace a statutory licence or professional registration requirement in the destination.",
        "check whether your occupation is regulated and start the official recognition or language process early"
      ),
      topic(
        "processing times",
        "Processing time is the combined time needed for recruitment, employer decisions, documents, appointments and government procedures, and it can vary substantially by country and case.",
        "throughout the application, especially when planning notice periods, travel or document validity",
        "timely candidate documents, employer responses, appointment confirmations and government application references",
        "Red Stone can provide known process information but cannot control government queues or employer decision speeds",
        "Avoid buying non-refundable travel or resigning from work solely on an estimated date before the required approvals are issued.",
        "complete your actions promptly and use official status updates when planning the next step"
      ),
    ],
  },
  {
    slug: "jobs-employers",
    name: "Jobs, Employers & Employment Terms",
    description:
      "Deep FAQs about published vacancies, employer screening, salaries, benefits, contracts and job authenticity.",
    keywords: ["international jobs", "employer verification", "job salary", "employment contract", "job benefits"],
    relatedHref: "/jobs",
    relatedLabel: "Browse Jobs",
    topics: [
      topic(
        "published vacancies",
        "A published vacancy is a job that Red Stone has made available in the public jobs system with role, location and application information that candidates can review.",
        "when the job is actively displayed and accepting applications subject to its deadline and vacancies",
        "the job listing, candidate application and any role-specific supporting documents",
        "Red Stone separates live published jobs from general sponsorship role pathways so candidates can see what is currently advertised",
        "A general job category or sponsorship pathway is not proof that a specific employer vacancy is open today.",
        "use the Jobs page and open the full job detail before applying"
      ),
      topic(
        "employer screening",
        "Employer screening is due diligence intended to confirm that a hiring organization and vacancy are suitable for recruitment coordination and that available information is consistent with a legitimate hiring need.",
        "before or during the process of accepting and publishing employer recruitment requirements",
        "company information, authorized contact details, vacancy terms and any supporting employer or sponsorship records appropriate to the case",
        "Red Stone reviews employer information as part of responsible recruitment, though no screening process can eliminate every external risk",
        "Candidates should still read the written offer, verify official contacts and report inconsistencies.",
        "use Red Stone's official channels if an employer message conflicts with the published job or recruitment instructions"
      ),
      topic(
        "salary and benefits",
        "Salary and benefits describe the compensation offered for the work, including base pay and any accommodation, food, transport, insurance, overtime or other employer-provided items.",
        "when reviewing a vacancy and again before accepting the final offer",
        "the job advertisement, written offer, employment contract and any benefit schedule or lawful deductions",
        "Red Stone displays salary information where available and distinguishes indicative ranges from final contractual pay",
        "Do not rely on a verbal salary promise that is missing from the written employment terms.",
        "compare the complete package, currency and working hours before accepting"
      ),
      topic(
        "employment contract",
        "An employment contract is the written agreement that records the role, employer, pay, working conditions, duration and other legal employment terms.",
        "after employer selection and before deployment or commencement of work, subject to the destination's law",
        "the signed contract or offer, employee and employer identity, job title, salary, work location, hours and benefit terms",
        "Red Stone can help candidates understand where the contract fits into the recruitment process but does not replace legal advice from a qualified professional",
        "Never sign blank pages, altered documents or terms you do not understand, and keep a complete copy.",
        "read the contract carefully, ask questions before signing and compare it with the job you applied for"
      ),
      topic(
        "job authenticity",
        "Job authenticity means the vacancy, employer communication and recruitment process can be connected to legitimate Red Stone or employer records rather than an impersonator or fabricated offer.",
        "before sending sensitive documents, paying an authorized processing cost or travelling",
        "the published vacancy, official email or domain, employer details, application reference and written offer where applicable",
        "Red Stone provides official channels and application records candidates can use to verify communication",
        "A logo, PDF offer letter or WhatsApp profile alone does not prove a job is genuine.",
        "cross-check the vacancy and contact details through redstone.co.ke and report suspicious differences"
      ),
    ],
  },
  {
    slug: "interviews-selection",
    name: "Interviews, Selection & Job Offers",
    description:
      "Interview preparation, remote interviews, employer selection, job offers and background verification explained in depth.",
    keywords: ["job interview preparation", "remote interview", "employer selection", "job offer", "background verification"],
    relatedHref: "/candidate-support",
    relatedLabel: "Candidate Support",
    topics: [
      topic(
        "interview preparation",
        "Interview preparation means understanding the role, reviewing your genuine experience and preparing clear examples that show how you can perform the work safely and professionally.",
        "after shortlisting and before the employer interview",
        "the job description, your CV, relevant certificates and practical examples from your real work history",
        "Red Stone can provide interview guidance and help candidates understand the role without coaching them to invent answers",
        "Memorized false experience can be exposed during practical questions or later verification.",
        "review the role, prepare truthful examples and test your phone, video or travel arrangements before the interview"
      ),
      topic(
        "remote interviews",
        "Remote interviews allow employers to assess candidates by video or phone when an in-person meeting is unnecessary or impractical.",
        "after shortlisting when the employer chooses a remote interview format",
        "a reliable device, internet connection, quiet location, identification if requested and the interview link or contact details",
        "Red Stone may coordinate the schedule and candidate communication for approved interviews",
        "Do not click unknown links or send payment simply to attend an interview; verify the invitation if anything looks unusual.",
        "confirm the date, time zone and platform and join early using the official invitation"
      ),
      topic(
        "employer selection outcome",
        "The selection outcome is the employer's decision to progress, hold, reject or offer employment to a candidate after reviewing the available evidence and interviews.",
        "after employer assessment and before most post-selection immigration and deployment steps",
        "interview results, employer notes, any requested references and the candidate's supporting documents",
        "Red Stone communicates or records the employer outcome where available and explains the next process stage",
        "Being shortlisted or interviewed does not mean you are selected until the employer confirms it.",
        "wait for official written confirmation and complete only the next steps requested for your case"
      ),
      topic(
        "job offer",
        "A job offer records the employer's intention to hire the candidate and should clearly identify the role, pay, location and important conditions before the candidate relies on it.",
        "after selection and before contract completion, immigration processing or deployment as applicable",
        "written offer, employer identity, job title, compensation, location, start conditions and sponsorship information where relevant",
        "Red Stone can coordinate the recruitment offer process and help identify missing information",
        "A forged offer letter can look professional, so verify the employer and Red Stone case rather than trusting appearance alone.",
        "review the offer against the original vacancy and ask for clarification on any changed terms"
      ),
      topic(
        "background and reference verification",
        "Background and reference verification checks whether the candidate's identity, work history, conduct or qualifications are consistent with what was presented in the application.",
        "during screening, after interview or before final hiring depending on the employer and role",
        "referee contacts, employment records, good-conduct certificate, certificates or other evidence lawfully relevant to the job",
        "Red Stone may coordinate verification steps on behalf of the recruitment process",
        "False references, altered certificates or hidden material inconsistencies can result in rejection or later employment problems.",
        "provide accurate records and notify referees that they may receive a legitimate verification request"
      ),
    ],
  },
  {
    slug: "travel-predeparture",
    name: "Travel, Pre-Departure & Arrival",
    description:
      "Detailed pre-departure FAQs covering final documents, flights, baggage, briefings, arrival and employer reporting.",
    keywords: ["pre departure support", "work travel documents", "air ticket", "baggage rules", "arrival employer reporting"],
    relatedHref: "/pre-departure-support",
    relatedLabel: "Pre-Departure Support",
    topics: [
      topic(
        "final travel documents",
        "Final travel documents are the identity, immigration, employment and itinerary records a worker should have ready before departure for an international placement.",
        "after the required employer and government approvals are in place and before the travel date",
        "valid passport, required visa or work authorization, itinerary, employer contact details, contract or reporting information and any destination-specific records",
        "Red Stone helps candidates perform a final readiness check before deployment",
        "Do not travel simply because a ticket exists if the required entry or work authorization has not been issued.",
        "keep originals secure, carry accessible copies and confirm the latest arrival instructions"
      ),
      topic(
        "flight and air ticket",
        "The flight is the transport arrangement for deployment and may be employer-funded only when the written sponsorship package or contract says so.",
        "after travel authorization and reporting dates are confirmed",
        "booking confirmation, passenger name matching the passport, itinerary, baggage allowance and any transit requirements",
        "Red Stone can coordinate or explain travel arrangements where included in the recruitment package",
        "Do not assume every applicant receives a free ticket; the employer offer controls the benefit, and transit rules can require additional checks.",
        "verify passenger details, route, baggage and transit conditions before departure"
      ),
      topic(
        "baggage preparation",
        "Baggage preparation means packing within airline limits while protecting essential documents, medicines and items needed for arrival and work.",
        "in the final days before departure after the itinerary and airline are confirmed",
        "airline baggage allowance, identification, prescriptions where required and a practical packing list",
        "Red Stone can remind candidates about travel readiness but the airline controls baggage rules and prohibited items",
        "Excess baggage or prohibited items can create additional charges or travel problems.",
        "check the airline's current baggage policy and keep passports, approvals and critical medicine in hand luggage where permitted"
      ),
      topic(
        "pre-departure briefing",
        "A pre-departure briefing prepares selected workers for travel, employer reporting, workplace expectations, safety, communication and practical destination awareness.",
        "after the case is approved for travel and before the departure date",
        "employer reporting details, emergency contacts, contract, itinerary and any destination instructions",
        "Red Stone uses the briefing to make sure candidates understand the transition from recruitment to deployment",
        "A briefing is not a substitute for immigration permission, legal advice or employer-specific workplace training.",
        "attend the briefing, ask unresolved questions and keep the official contact information accessible"
      ),
      topic(
        "arrival and employer reporting",
        "Arrival and employer reporting are the first post-travel steps in which the worker follows the confirmed instructions for meeting the employer, sponsor or authorized representative.",
        "after entering the destination and completing any airport or immigration formalities",
        "passport, entry records, employer contact, reporting address, local phone information where available and required employment documents",
        "Red Stone can help candidates understand the expected reporting arrangement and follow up on recruitment-side issues",
        "Do not leave with an unknown person or follow changed instructions that cannot be verified through the employer or Red Stone.",
        "confirm the authorized contact before departure and report any serious discrepancy immediately"
      ),
    ],
  },
  {
    slug: "safety-fraud",
    name: "Safety, Fraud Prevention & Complaints",
    description:
      "Protect yourself from fake job offers, impersonation, unauthorized payments, document theft and recruitment fraud.",
    keywords: ["recruitment fraud", "fake job offer", "job scam", "official recruitment channels", "report recruitment fraud"],
    relatedHref: "/fraud-awareness",
    relatedLabel: "Fraud Awareness",
    topics: [
      topic(
        "official Red Stone channels",
        "Official Red Stone channels are the website, verified company email addresses and contact methods published by Red Stone for recruitment and support.",
        "whenever a candidate receives instructions, payment requests, offers or changes to an existing case",
        "the sender email or phone, application reference and the corresponding information shown on redstone.co.ke",
        "Red Stone publishes official channels so candidates can independently verify messages instead of trusting an unfamiliar contact",
        "Impersonators can copy logos, names and profile pictures, so appearance alone is not proof of authenticity.",
        "compare the contact with the official website before sending money or sensitive documents"
      ),
      topic(
        "fake job offers",
        "A fake job offer is a fabricated or impersonated employment document designed to convince someone that an employer has selected them when no legitimate offer exists.",
        "before a candidate acts on any unexpected offer, especially one that demands urgent payment or secrecy",
        "the full offer letter, sender address, employer name, vacancy reference and any related application details",
        "Red Stone can compare suspicious offers with its recruitment records and official communication channels",
        "Warning signs include guaranteed visas, unrealistic salaries, missing employer details, pressure to pay immediately or instructions to use personal accounts.",
        "do not pay or travel until the offer and employer communication are independently verified"
      ),
      topic(
        "unauthorized payment requests",
        "An unauthorized payment request asks a candidate to send money outside the documented Red Stone or official provider process, often using a personal number, private account or invented fee.",
        "at any stage where a new fee appears unexpectedly or the payment destination differs from previous official instructions",
        "the message, amount, payment account, sender identity and any transaction reference if already paid",
        "Red Stone can confirm whether a fee and payment route belong to the candidate's actual case",
        "Never share payment PINs or one-time codes, and do not pay for guaranteed selection, visas or sponsorship.",
        "pause the transaction and verify the charge through official Red Stone support"
      ),
      topic(
        "document and identity security",
        "Document security protects passports, national IDs, certificates, medical records and other sensitive information from theft, misuse or unnecessary disclosure.",
        "throughout recruitment, especially when uploading or sending identity and immigration records",
        "only the documents genuinely required for the current stage and the official upload or communication channel",
        "Red Stone collects recruitment information for legitimate process purposes and encourages candidates to use controlled channels",
        "Avoid posting passport images in public groups or sending sensitive files to unverified personal accounts.",
        "use the official portal or specified company channel and keep secure copies of what you submitted"
      ),
      topic(
        "reporting concerns and complaints",
        "Reporting concerns gives candidates and employers a formal way to raise suspected fraud, service problems, payment disputes, privacy issues or other recruitment concerns.",
        "as soon as a serious concern arises or ordinary support has not resolved the issue",
        "application or payment reference, dates, messages, screenshots, documents and a clear description of the concern",
        "Red Stone can review complaints, investigate internal records and respond through its official process",
        "Do not publish sensitive personal information or continue paying a suspicious person while waiting for help.",
        "submit the concern through the published complaints or contact channel with enough evidence to investigate"
      ),
    ],
  },
  {
    slug: "accounts-data-support",
    name: "Accounts, Privacy & Candidate Support",
    description:
      "FAQs about account access, contact details, privacy, data handling, account deletion and how to get support.",
    keywords: ["candidate account", "privacy recruitment", "data protection", "account deletion", "candidate support"],
    relatedHref: "/candidate-support",
    relatedLabel: "Candidate Support",
    topics: [
      topic(
        "candidate account access",
        "A candidate account provides the secure place where a user can manage application information and follow the Red Stone recruitment workflow.",
        "from registration through the active application lifecycle",
        "the registered email or authentication method and any security verification required by the account system",
        "Red Stone uses account access to keep application actions connected to the correct user",
        "Do not share passwords, verification codes or account access with another person claiming they need to complete the application for you.",
        "use your own login and contact support if you lose access rather than creating conflicting records"
      ),
      topic(
        "email and phone details",
        "Current email and phone details allow Red Stone to contact the candidate about application actions, interviews, payments and time-sensitive employer requests.",
        "throughout recruitment whenever contact information changes",
        "the current phone number and email address that the candidate controls",
        "Red Stone uses these details for recruitment communication and account-related notices",
        "An outdated phone or email can cause missed interviews or security problems if the address is later controlled by someone else.",
        "update your contact information promptly and verify unusual messages through official channels"
      ),
      topic(
        "privacy and data use",
        "Recruitment data can include identity, contact, CV, document and application information needed to evaluate and administer a candidate's recruitment case.",
        "when the candidate creates an account, submits an application or provides documents for a legitimate recruitment purpose",
        "only information relevant to the application, employer consideration, compliance or other lawful process stage",
        "Red Stone handles personal information under its privacy and data-protection terms and uses it for legitimate recruitment, security and legal purposes",
        "Sensitive data should not be collected merely because it might be useful later, and candidates should avoid sending unnecessary medical or identity records.",
        "review the privacy notice and use official channels when submitting personal information"
      ),
      topic(
        "account deletion",
        "Account deletion is the process for requesting removal or closure of a candidate account, subject to records Red Stone may need to retain for legal, financial, fraud-prevention or legitimate business reasons.",
        "when a user no longer wants the account or exercises an applicable data-protection right",
        "identity or account details sufficient to verify the requester and identify the records involved",
        "Red Stone can process deletion or restriction requests under its account-deletion and data-protection procedures",
        "Deletion may not immediately erase records that must legally be retained, and deleting an account can affect access to existing applications.",
        "use the published account-deletion request process and read the consequences before confirming"
      ),
      topic(
        "candidate support",
        "Candidate support helps users understand the application, documents, interviews, payments, medicals and next actions connected to their Red Stone recruitment case.",
        "whenever the candidate is uncertain about a legitimate process step or encounters a problem with the portal or instructions",
        "application ID, concise description of the problem and any relevant screenshots or transaction references that do not expose passwords or PINs",
        "Red Stone support can explain the process and check internal case information but cannot guarantee employer or government decisions",
        "Avoid sending the same issue to multiple unofficial contacts, which can create conflicting instructions.",
        "contact the published Red Stone support channel and include the application reference for faster case identification"
      ),
    ],
  },
];

export const FAQ_CATEGORIES: FaqCategory[] = seeds.map((seed) => ({
  ...seed,
  faqs: seed.topics.flatMap((item, topicIndex) => buildTopicFaqs(seed.slug, topicIndex, item)),
}));

export const FAQ_TOTAL = FAQ_CATEGORIES.reduce((total, category) => total + category.faqs.length, 0);

export function getFaqCategory(slug: string) {
  return FAQ_CATEGORIES.find((category) => category.slug === slug);
}

export function getAllFaqs() {
  return FAQ_CATEGORIES.flatMap((category) =>
    category.faqs.map((faq) => ({ ...faq, categorySlug: category.slug, categoryName: category.name }))
  );
}

function topic(
  label: string,
  overview: string,
  stage: string,
  documents: string,
  redStoneRole: string,
  caution: string,
  nextStep: string
): Topic {
  return { label, overview, stage, documents, redStoneRole, caution, nextStep };
}

function buildTopicFaqs(categorySlug: string, topicIndex: number, item: Topic): FaqItem[] {
  const key = `${categorySlug}-${topicIndex + 1}`;
  return [
    {
      id: `${key}-what-is`,
      question: `What is ${item.label}, and why does it matter in international recruitment?`,
      answer: `${item.overview} It becomes especially relevant ${item.stage}. In practical terms, candidates may need ${item.documents}. ${item.redStoneRole}. ${item.caution} A sensible next step is to ${item.nextStep}.`,
    },
    {
      id: `${key}-when`,
      question: `When does ${item.label} become important in the Red Stone process?`,
      answer: `${item.label[0].toUpperCase()}${item.label.slice(1)} normally becomes important ${item.stage}. The timing matters because completing a later-stage requirement too early can create unnecessary cost, expired documents or confusion about what the employer or authority actually needs. Typical supporting information may include ${item.documents}. ${item.redStoneRole}. ${item.caution} Before acting, candidates should ${item.nextStep}.`,
    },
    {
      id: `${key}-documents`,
      question: `What documents or evidence may be needed for ${item.label}?`,
      answer: `The exact evidence depends on the vacancy, employer, destination and stage, but candidates should expect to prepare ${item.documents}. The purpose of those records is to support identity, experience, eligibility or the specific requirement connected to ${item.label}. ${item.redStoneRole}. Documents should be genuine, readable and consistent with the information already provided in the application. ${item.caution} If a checklist is unclear, the safest approach is to ${item.nextStep}.`,
    },
    {
      id: `${key}-red-stone-help`,
      question: `How does Red Stone help with ${item.label}?`,
      answer: `${item.redStoneRole}. That support is designed to keep the candidate in the correct recruitment sequence rather than treating every requirement as something that must be completed immediately. ${item.overview} The relevant stage is usually ${item.stage}, and candidates may be asked for ${item.documents}. Red Stone does not replace the employer, medical provider, licensing body or government authority responsible for its own decision. ${item.caution} Candidates should still ${item.nextStep}.`,
    },
    {
      id: `${key}-before`,
      question: `What should I do before starting ${item.label}?`,
      answer: `Before starting ${item.label}, first confirm that your case has reached the correct stage: ${item.stage}. Review the current instruction and make sure the request is connected to your real Red Stone application, vacancy or official process. Prepare ${item.documents}, but avoid sending extra sensitive information that was not requested. ${item.redStoneRole}. ${item.caution} The practical preparation step is to ${item.nextStep}.`,
    },
    {
      id: `${key}-after`,
      question: `What usually happens after ${item.label} is completed?`,
      answer: `What happens next depends on the recruitment stage and the result of any employer or authority review. ${item.overview} Once the relevant requirement is completed, Red Stone can use the case record to determine whether the candidate should move to another recruitment, document, employer, compliance, immigration or travel step. Any further evidence may still include ${item.documents} if something was missing or needs updating. ${item.caution} Completion of one stage should therefore be treated as progress, not as a final guarantee. Continue by following the official case instruction and ${item.nextStep}.`,
    },
    {
      id: `${key}-mistakes`,
      question: `What mistakes should I avoid with ${item.label}?`,
      answer: `The most common mistake is treating ${item.label} as proof that every later step is already approved. ${item.caution} Candidates should also avoid false information, altered documents, unofficial payment channels, unnecessary duplicate applications and instructions from contacts that cannot be verified. Where evidence is required, prepare ${item.documents} and make sure it matches the application. ${item.redStoneRole}. If anything conflicts with the website or your candidate record, stop and ${item.nextStep}.`,
    },
    {
      id: `${key}-guarantee`,
      question: `Does ${item.label} guarantee a job, sponsorship, work permit or visa?`,
      answer: `No. ${item.overview} It is one part of a wider process and becomes relevant ${item.stage}. Employer hiring decisions, medical assessments, professional licensing and government immigration decisions are controlled by the organizations legally responsible for them. ${item.redStoneRole}. ${item.caution} Candidates should view completion of the requirement as evidence that a stage has been handled correctly, not as a promise of the final outcome. The next action is to ${item.nextStep}.`,
    },
  ];
}
