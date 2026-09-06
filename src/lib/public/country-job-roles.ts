export type CountryJobRole = {
  key: string;
  title: string;
  summary: string;
  typicalDuties: string[];
  candidateProfile: string;
  complianceNote: string;
};

const role = (
  key: string,
  title: string,
  summary: string,
  typicalDuties: string[],
  candidateProfile: string,
  complianceNote = "Employer requirements, licensing, language standards and work authorization depend on the vacancy and destination."
): CountryJobRole => ({ key, title, summary, typicalDuties, candidateProfile, complianceNote });

export const COUNTRY_JOB_ROLES: Record<string, CountryJobRole> = {
  housekeeper: role(
    "housekeeper",
    "Housekeeper",
    "Maintain guest rooms, residences, hotels or institutional accommodation to required cleanliness, hygiene and presentation standards.",
    ["Clean rooms, bathrooms and shared areas", "Change linen and prepare rooms", "Restock basic supplies", "Report maintenance or safety concerns"],
    "Best suited to reliable candidates with strong attention to detail, safe cleaning habits and the physical ability to complete routine housekeeping tasks."
  ),
  cleaner: role(
    "cleaner",
    "Commercial / Facility Cleaner",
    "Provide routine cleaning and sanitation for offices, hotels, malls, hospitals, schools, warehouses or other facilities using approved products and equipment.",
    ["Sweep, mop and vacuum floors", "Sanitize washrooms and high-touch surfaces", "Remove waste safely", "Follow chemical-handling and site safety procedures"],
    "Cleaning experience is useful but some employers accept entry-level applicants who can demonstrate reliability, punctuality and safe working practices."
  ),
  security: role(
    "security",
    "Security Guard",
    "Protect people, property and premises through access control, observation, patrols, incident reporting and support for emergency procedures.",
    ["Monitor entrances and restricted areas", "Conduct scheduled patrols", "Record incidents accurately", "Assist visitors and follow emergency protocols"],
    "Suitable for disciplined candidates with a clean conduct record where required, good communication, situational awareness and the ability to work shifts.",
    "Security licensing, training, background checks and minimum physical standards can apply and vary by destination."
  ),
  caregiver: role(
    "caregiver",
    "Caregiver / Personal Support Worker",
    "Support older adults, people with disabilities or clients who need assistance with daily living, mobility, meals, companionship and approved personal-care tasks.",
    ["Assist with daily routines", "Support safe mobility", "Prepare simple meals", "Observe and report changes to the appropriate supervisor"],
    "Employers commonly value patience, empathy, communication skills and previous care experience. Formal training may be required for regulated care settings.",
    "Care roles may require police checks, health screening, first-aid credentials, recognized training or professional registration depending on the country and employer."
  ),
  nurse: role(
    "nurse",
    "Registered Nurse",
    "Provide professional nursing care in hospitals, clinics, aged-care facilities or community settings within the scope permitted by the destination regulator.",
    ["Assess and monitor patients", "Administer approved treatment and medication", "Maintain clinical records", "Coordinate with multidisciplinary healthcare teams"],
    "Applicants normally need recognized nursing qualifications, relevant clinical experience and evidence of professional good standing.",
    "Nursing is regulated in most destinations. Registration, credential recognition, language testing and licensing must be completed where required before practice."
  ),
  healthcareAssistant: role(
    "healthcare-assistant",
    "Healthcare Assistant",
    "Support nurses and care teams with non-registered clinical support, patient comfort, hygiene, mobility and routine care activities permitted by the employer.",
    ["Assist patients with basic daily needs", "Support mobility and positioning", "Maintain a clean care environment", "Report observations to clinical staff"],
    "Suitable for caring candidates with relevant support-work experience or training and a strong commitment to patient dignity and safety.",
    "Scope of practice differs by country. Health checks, background screening, vaccination evidence or recognized care training may be required."
  ),
  nanny: role(
    "nanny",
    "Nanny / Childcare Worker",
    "Provide safe and dependable childcare in a private household, nursery or approved childcare setting while supporting routines, meals, play and age-appropriate activities.",
    ["Supervise children safely", "Prepare simple meals and snacks", "Support hygiene and routines", "Maintain tidy child-care areas"],
    "Employers often prefer genuine childcare experience, patience, safeguarding awareness, references and strong reliability.",
    "Childcare roles can require police/background checks, first-aid training, safeguarding checks and specific visa eligibility."
  ),
  warehouse: role(
    "warehouse",
    "Warehouse Worker / Storeperson",
    "Receive, move, sort, pick, pack and dispatch goods while following inventory, manual-handling and workplace-safety procedures.",
    ["Load and unload goods", "Pick and pack orders", "Label and organize stock", "Maintain safe aisles and work areas"],
    "Suitable for organized candidates who can follow instructions accurately and perform routine warehouse tasks safely.",
    "Forklift or equipment licences are required only for roles that involve regulated machinery."
  ),
  logistics: role(
    "logistics",
    "Logistics / Dispatch Assistant",
    "Support transport, dispatch, inventory and delivery coordination by preparing records, organizing shipments and communicating with warehouse and transport teams.",
    ["Prepare dispatch documents", "Track incoming and outgoing goods", "Coordinate loading schedules", "Update inventory or delivery records"],
    "Employers value accuracy, basic computer skills, communication and previous logistics or warehouse exposure."
  ),
  truckDriver: role(
    "truck-driver",
    "Truck / Heavy Vehicle Driver",
    "Operate commercial vehicles safely, complete inspections, transport goods and maintain route, delivery and compliance records.",
    ["Complete pre-trip vehicle checks", "Transport loads safely", "Maintain delivery documentation", "Follow driving-hour and road-safety rules"],
    "Applicants normally need relevant commercial driving experience, a safe driving history and the ability to meet transport medical and licence requirements.",
    "Licence recognition or conversion, medical standards and heavy-vehicle endorsements vary by destination and must be confirmed before employment."
  ),
  deliveryDriver: role(
    "delivery-driver",
    "Delivery / Light Vehicle Driver",
    "Deliver goods, parcels, food or supplies using a light commercial vehicle while maintaining safe driving and delivery records.",
    ["Inspect assigned vehicle", "Follow delivery routes", "Handle delivery documentation", "Load and unload within safe limits"],
    "Suitable for candidates with a valid licence, responsible driving habits, good time management and customer-service skills.",
    "Driving licence conversion, local road permits and employer insurance conditions may apply."
  ),
  farmWorker: role(
    "farm-worker",
    "General Farm Worker",
    "Support crop, livestock or mixed-farm operations with planting, harvesting, feeding, cleaning, sorting, packing and routine farm maintenance.",
    ["Assist planting or harvesting", "Care for livestock where assigned", "Clean equipment and work areas", "Sort, grade or pack farm products"],
    "Farm experience is useful, but seasonal employers may also consider physically capable entry-level workers who can work outdoors and follow safety instructions.",
    "Seasonal programmes, biosecurity rules, employer accreditation and accommodation arrangements vary by destination."
  ),
  horticulture: role(
    "horticulture",
    "Horticulture / Greenhouse Worker",
    "Support commercial growing operations by planting, pruning, watering, harvesting, grading and packing fruit, vegetables, flowers or nursery products.",
    ["Plant and maintain crops", "Harvest and grade produce", "Pack products for dispatch", "Follow hygiene and biosecurity rules"],
    "Suitable for candidates comfortable with repetitive outdoor or greenhouse work and seasonal schedules."
  ),
  construction: role(
    "construction",
    "Construction Worker / General Labourer",
    "Support building and civil works through site preparation, material handling, basic tool use, cleanup and assistance to qualified tradespeople.",
    ["Move and prepare materials", "Assist skilled trades", "Maintain safe work areas", "Follow site instructions and PPE requirements"],
    "Employers value practical experience, physical readiness, safety awareness and the ability to work as part of a site team.",
    "Construction safety cards, trade certification or site-specific induction may be mandatory."
  ),
  electrician: role(
    "electrician",
    "Electrician",
    "Install, inspect, maintain and repair electrical systems according to approved plans, technical standards and local safety rules.",
    ["Install wiring and equipment", "Diagnose electrical faults", "Test systems", "Complete maintenance and safety records"],
    "Applicants normally need trade training, practical experience and evidence of competence in electrical installation or maintenance.",
    "Electrical work is regulated in many countries. Licence recognition, supervised practice or local certification may be required."
  ),
  plumber: role(
    "plumber",
    "Plumber / Pipefitter",
    "Install, repair and maintain water, drainage, sanitary, heating or industrial piping systems according to technical and safety standards.",
    ["Read plans and measure pipe runs", "Install pipes and fittings", "Diagnose leaks and faults", "Test completed systems"],
    "Suitable for trained tradespeople with practical plumbing or pipefitting experience and safe tool-handling skills.",
    "Trade recognition or local licensing can apply, especially for regulated plumbing and gas work."
  ),
  welder: role(
    "welder",
    "Welder / Fabricator",
    "Join, repair and fabricate metal components using approved welding processes while following drawings, quality standards and safety procedures.",
    ["Prepare metal surfaces", "Perform required welding processes", "Inspect completed welds", "Follow workshop and PPE rules"],
    "Applicants should be able to demonstrate practical welding experience; recognized trade tests or process certifications can strengthen eligibility.",
    "Employer-specific welding tests and destination trade certification may be required."
  ),
  carpenter: role(
    "carpenter",
    "Carpenter / Joiner",
    "Construct, install and repair timber structures, formwork, fittings and interior components using plans and safe workshop or site practices.",
    ["Measure and cut materials", "Assemble structures and fittings", "Install doors, frames or formwork", "Maintain tools and safe work areas"],
    "Suitable for experienced carpenters who can read measurements, use tools safely and produce accurate work."
  ),
  mechanic: role(
    "mechanic",
    "Automotive / Equipment Mechanic",
    "Inspect, service, diagnose and repair vehicles or mechanical equipment while following manufacturer and workplace procedures.",
    ["Perform routine servicing", "Diagnose faults", "Repair or replace components", "Maintain service records"],
    "Applicants typically need mechanical training, hands-on experience and safe use of diagnostic and workshop equipment.",
    "Trade licensing or certification recognition may apply to some automotive and heavy-equipment occupations."
  ),
  machineOperator: role(
    "machine-operator",
    "Machine / Production Operator",
    "Operate production, packaging or processing equipment safely, monitor output and complete routine quality and cleaning checks.",
    ["Start and monitor machinery", "Check product quality", "Record production information", "Clean equipment and work areas"],
    "Suitable for candidates with manufacturing experience, strong safety awareness and the ability to follow standard operating procedures."
  ),
  factory: role(
    "factory",
    "Factory / Production Worker",
    "Support manufacturing or food-production lines with assembly, packing, sorting, labeling and basic production tasks.",
    ["Prepare materials", "Pack and label products", "Inspect items for obvious defects", "Maintain clean production areas"],
    "Entry-level opportunities may be available, although employers commonly require reliability, shift flexibility and the ability to follow hygiene and safety procedures."
  ),
  foodProduction: role(
    "food-production",
    "Food Production / Processing Worker",
    "Prepare, process, pack and label food products in commercial production environments under strict hygiene and quality procedures.",
    ["Prepare production materials", "Operate approved basic equipment", "Pack and label products", "Follow food-safety and sanitation rules"],
    "Suitable for dependable candidates who can work in temperature-controlled environments and follow hygiene procedures closely."
  ),
  hotel: role(
    "hotel",
    "Hotel / Hospitality Attendant",
    "Support hotel operations in guest service, housekeeping coordination, public areas, food service or general hospitality duties.",
    ["Assist guests professionally", "Prepare service areas", "Support room or public-area operations", "Follow hygiene and customer-service standards"],
    "Hospitality experience, good presentation, teamwork and basic customer communication are commonly valued."
  ),
  receptionist: role(
    "receptionist",
    "Hotel Receptionist / Front Desk Agent",
    "Welcome guests, manage check-in and check-out, handle reservations, answer enquiries and coordinate with hotel departments.",
    ["Process guest arrivals and departures", "Manage bookings and enquiries", "Handle basic billing records", "Coordinate guest requests"],
    "Employers often seek strong communication, computer literacy, professional presentation and previous front-office experience."
  ),
  waiter: role(
    "waiter",
    "Waiter / Restaurant Server",
    "Provide table service in restaurants, hotels or catering venues by taking orders, serving food and beverages and maintaining clean service areas.",
    ["Prepare tables", "Take and communicate orders", "Serve guests professionally", "Maintain hygiene in service areas"],
    "Suitable for customer-focused candidates with good communication, teamwork and the ability to work busy shifts."
  ),
  cook: role(
    "cook",
    "Cook / Kitchen Worker",
    "Prepare meals or support commercial kitchens by following recipes, portion standards, hygiene procedures and supervisor instructions.",
    ["Prepare ingredients", "Cook assigned menu items", "Maintain kitchen hygiene", "Store food correctly"],
    "Previous kitchen experience is valuable; formal culinary training may be preferred for higher-responsibility positions.",
    "Food-safety certification or employer trade testing may be required."
  ),
  chef: role(
    "chef",
    "Chef",
    "Plan and prepare professional food service, supervise kitchen production and maintain quality, food safety and cost-control standards.",
    ["Prepare and present menu items", "Coordinate kitchen workflow", "Maintain food-safety controls", "Support stock and portion management"],
    "Applicants normally need substantial culinary experience and may need recognized qualifications for senior or sponsored positions."
  ),
  retail: role(
    "retail",
    "Retail / Sales Assistant",
    "Support customers, arrange merchandise, process transactions and maintain clean, organized retail spaces.",
    ["Assist customers", "Stock shelves and displays", "Operate approved point-of-sale systems", "Maintain store presentation"],
    "Employers commonly value communication, honesty, customer service and flexible availability."
  ),
  laundry: role(
    "laundry",
    "Laundry Attendant",
    "Process hotel, hospital, commercial or residential laundry by sorting, washing, drying, folding and recording linen movement.",
    ["Sort laundry safely", "Operate washers and dryers", "Fold and prepare linen", "Maintain clean laundry areas"],
    "Suitable for candidates who can work consistently, handle repetitive tasks and follow hygiene and equipment instructions."
  ),
  hairdresser: role(
    "hairdresser",
    "Hairdresser / Barber",
    "Provide hair cutting, styling, grooming and related salon services while maintaining professional hygiene and customer-care standards.",
    ["Consult clients", "Cut and style hair", "Clean and disinfect tools", "Maintain service records where required"],
    "Applicants benefit from a strong portfolio, recognized training and customer-service experience.",
    "Local licensing or qualification recognition may apply depending on the destination."
  ),
  painter: role(
    "painter",
    "Painter / Decorator",
    "Prepare and finish interior or exterior surfaces using paints, coatings and approved application methods.",
    ["Prepare surfaces", "Mix and apply coatings", "Protect surrounding areas", "Maintain tools and safe work zones"],
    "Suitable for candidates with practical painting experience, attention to finish quality and safe use of ladders or access equipment."
  ),
  itSupport: role(
    "it-support",
    "IT Support Technician",
    "Provide first-line technical support for computers, software, networks and user accounts while documenting incidents and solutions.",
    ["Troubleshoot user issues", "Install approved hardware and software", "Maintain support tickets", "Escalate complex incidents"],
    "Employers commonly seek practical troubleshooting skills, customer communication and relevant IT training or certifications."
  ),
  software: role(
    "software",
    "Software Developer",
    "Design, build, test and maintain software applications or services using the employer's technology stack and engineering standards.",
    ["Develop software features", "Review and test code", "Maintain technical documentation", "Collaborate with product and engineering teams"],
    "Applicants usually need demonstrable programming ability, relevant experience and a portfolio or technical interview performance appropriate to the role."
  ),
  engineer: role(
    "engineer",
    "Engineer",
    "Apply professional engineering knowledge to design, analyse, supervise or maintain systems and projects in disciplines such as civil, mechanical, electrical or industrial engineering.",
    ["Prepare or review technical designs", "Analyse project requirements", "Coordinate technical work", "Maintain quality and safety documentation"],
    "A recognized engineering qualification and relevant professional experience are normally required.",
    "Professional title recognition or registration may be required for regulated engineering work."
  ),
  technician: role(
    "technician",
    "Technical / Maintenance Technician",
    "Inspect, maintain and repair building systems, industrial equipment or technical installations using preventive-maintenance schedules and safe procedures.",
    ["Inspect equipment", "Complete routine maintenance", "Diagnose basic faults", "Record repairs and escalate major issues"],
    "Suitable for technically trained candidates with hands-on maintenance experience and strong safety awareness."
  ),
  teachingAssistant: role(
    "teaching-assistant",
    "Teaching Assistant / Education Support Worker",
    "Support teachers and learners in classrooms or educational programmes through supervision, learning activities and administrative assistance.",
    ["Support classroom activities", "Assist learners under teacher direction", "Prepare learning materials", "Maintain safeguarding and attendance procedures"],
    "Employers may require relevant education experience, language ability and a clean background check.",
    "Child-safeguarding checks and local education credentials can be mandatory."
  ),
};

export function getCountryJobRoles(keys: string[]) {
  return keys.map((key) => COUNTRY_JOB_ROLES[key]).filter(Boolean);
}
