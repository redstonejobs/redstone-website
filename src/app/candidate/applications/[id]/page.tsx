import Link from "next/link";
import { notFound } from "next/navigation";

import {
  addCandidateAddress,
  addCandidateDependant,
  addCandidateEducation,
  addCandidateEmployment,
  addCandidateLanguage,
  addCandidateProfessionalLicense,
  addCandidateTravelHistory,
  addCandidateVisaHistory,
  addCandidateEmergencyContact,
  addCandidateReference,
  saveCandidateFinancialInformation,
  saveCandidateImmigrationDeclarations,
  completeCandidateAddressSection,
  completeCandidateEducationSection,
  completeCandidateEmploymentSection,
  completeCandidateFamilySection,
  completeCandidateLanguagesSection,
  completeCandidateLicensesSection,
  completeCandidateTravelSection,
  completeCandidateVisaSection,
  completeCandidateEmergencySection,
  completeCandidateReferencesSection,
  completeCandidateFinancesSection,
  completeCandidateDeclarationsSection,
  deleteCandidateAddress,
  deleteCandidateDependant,
  deleteCandidateEducation,
  deleteCandidateEmployment,
  deleteCandidateLanguage,
  deleteCandidateProfessionalLicense,
  deleteCandidateTravelHistory,
  deleteCandidateVisaHistory,
  deleteCandidateEmergencyContact,
  deleteCandidateReference,
  saveCandidatePassportInformation,
  saveCandidatePersonalInformation,
  uploadCandidateDocument,
  withdrawApplication,
} from "@/lib/candidate/actions";

import { dateText } from "@/lib/admin/format";
import { requireCandidate } from "@/lib/candidate/auth";

import {
  candidateDocumentStatus,
  candidateStatusLabel,
  DOCUMENT_TYPES,
  WITHDRAWABLE_STATUSES,
} from "@/lib/candidate/constants";

import { getCandidateApplication } from "@/lib/candidate/data";
import { createClient } from "@/utils/supabase/server";

type Props = {
  params: Promise<{ id: string }>;

  searchParams?: Promise<
    Record<string, string | string[] | undefined>
  >;
};

type ImmigrationProfile = {
  given_names?: string | null;
  family_name?: string | null;
  other_names?: string | null;
  previous_names?: string | null;

  sex?: string | null;
  date_of_birth?: string | null;
  place_of_birth?: string | null;
  country_of_birth?: string | null;

  nationality?: string | null;
  other_citizenships?: string[] | null;

  marital_status?: string | null;
  national_id_number?: string | null;

  passport_number?: string | null;
  passport_issue_country?: string | null;
  passport_issue_date?: string | null;
  passport_expiry_date?: string | null;

  residence_country?: string | null;
  residence_status?: string | null;

  primary_phone?: string | null;
  primary_email?: string | null;
  preferred_language?: string | null;

  has_dependants?: boolean | null;
  dependants_count?: number | null;
};

type ProgressRow = {
  section_key: string;
  status: string;
};

type AddressRow = {
  id: string;
  address_type?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state_province?: string | null;
  postal_code?: string | null;
  country?: string | null;
  from_date?: string | null;
  to_date?: string | null;
  is_current?: boolean | null;
};

type DependantRow = {
  id: string;
  full_name: string;
  relationship: string;
  date_of_birth?: string | null;
  nationality?: string | null;
  country_of_residence?: string | null;
  passport_number?: string | null;
  accompanying_applicant?: boolean | null;
  visa_required?: boolean | null;
};

type EducationRow = {
  id: string;
  institution_name: string;
  country?: string | null;
  qualification?: string | null;
  field_of_study?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  completed?: boolean | null;
  graduation_date?: string | null;
  certificate_available?: boolean | null;
};

type EmploymentRow = {
  id: string;
  employer_name: string;
  job_title: string;
  country?: string | null;
  city?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current?: boolean | null;
  duties?: string | null;
  reason_for_leaving?: string | null;
  supervisor_name?: string | null;
  supervisor_contact?: string | null;
  reference_permission?: boolean | null;
};

type LanguageRow = {
  id: string;
  language: string;
  speaking_level?: string | null;
  reading_level?: string | null;
  writing_level?: string | null;
  listening_level?: string | null;
  test_name?: string | null;
  test_score?: string | null;
  test_date?: string | null;
};

type LicenseRow = {
  id: string;
  license_name: string;
  issuing_authority?: string | null;
  license_number?: string | null;
  country?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
};

type TravelRow = {
  id: string;
  country: string;
  purpose?: string | null;
  arrival_date?: string | null;
  departure_date?: string | null;
  visa_type?: string | null;
};

type VisaRow = {
  id: string;
  country: string;
  visa_type?: string | null;
  application_date?: string | null;
  decision?: string | null;
  decision_date?: string | null;
  visa_number?: string | null;
  valid_from?: string | null;
  valid_until?: string | null;
  refusal_reason?: string | null;
};

type EmergencyContactRow = {
  id: string;
  full_name: string;
  relationship?: string | null;
  phone: string;
  alternate_phone?: string | null;
  email?: string | null;
  city?: string | null;
  country?: string | null;
};

type ReferenceRow = {
  id: string;
  full_name: string;
  relationship?: string | null;
  organisation?: string | null;
  job_title?: string | null;
  phone?: string | null;
  email?: string | null;
  country?: string | null;
  can_contact?: boolean | null;
};

type FinancialInformationRow = {
  application_id: string;
  funding_source?: string | null;
  sponsor_name?: string | null;
  sponsor_relationship?: string | null;
  currency?: string | null;
  available_funds?: number | null;
  monthly_income?: number | null;
  proof_of_funds_available?: boolean | null;
  employer_sponsorship_expected?: boolean | null;
  employer_covers_visa?: boolean | null;
  employer_covers_flight?: boolean | null;
  employer_covers_accommodation?: boolean | null;
  employer_covers_medical?: boolean | null;
  financial_notes?: string | null;
};

type ImmigrationDeclarationsRow = {
  application_id: string;
  previous_visa_refusal?: boolean | null;
  previous_visa_refusal_details?: string | null;
  previous_overstay?: boolean | null;
  previous_overstay_details?: string | null;
  previous_deportation_or_removal?: boolean | null;
  previous_deportation_details?: string | null;
  immigration_violation?: boolean | null;
  immigration_violation_details?: string | null;
  criminal_charge_or_conviction?: boolean | null;
  criminal_details?: string | null;
  military_service?: boolean | null;
  military_service_details?: string | null;
  government_service?: boolean | null;
  government_service_details?: string | null;
  medical_disclosure_required?: boolean | null;
  medical_disclosure_details?: string | null;
  consent_to_data_processing?: boolean | null;
  consent_to_employer_sharing?: boolean | null;
  consent_to_authority_sharing?: boolean | null;
  certify_true_and_complete?: boolean | null;
  declaration_signed_name?: string | null;
  declaration_signed_at?: string | null;
};

const SECTIONS = [
  { key: "personal", label: "Personal" },
  { key: "passport", label: "Passport" },
  { key: "addresses", label: "Addresses" },
  { key: "family", label: "Family" },
  { key: "education", label: "Education" },
  { key: "employment", label: "Employment" },
  { key: "languages", label: "Languages" },
  { key: "licenses", label: "Licences" },
  { key: "travel", label: "Travel" },
  { key: "visas", label: "Visa History" },
  {
    key: "emergency",
    label: "Emergency Contact",
  },
  { key: "references", label: "References" },
  { key: "finances", label: "Finances" },
  {
    key: "declarations",
    label: "Declarations",
  },
  { key: "documents", label: "Documents" },
  { key: "review", label: "Review" },
];

const LANGUAGE_LEVELS = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Basic",
  "None",
];

function value(input: unknown) {
  return input == null ? "" : String(input);
}

function titleCase(input: string) {
  return input
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase(),
    )
    .join(" ");
}

function caseReference(id: string) {
  return `APP-${id.slice(0, 8).toUpperCase()}`;
}

function yesNoUnknown(
  input: boolean | null | undefined,
) {
  if (input === true) {
    return "Yes";
  }

  if (input === false) {
    return "No";
  }

  return "Not specified";
}

function licenseStatus(
  expiryDate?: string | null,
) {
  if (!expiryDate) {
    return {
      label: "No Expiry Date",
      state: "neutral" as const,
    };
  }

  const today = new Date()
    .toISOString()
    .slice(0, 10);

  if (expiryDate < today) {
    return {
      label: "Expired",
      state: "expired" as const,
    };
  }

  return {
    label: "Valid",
    state: "valid" as const,
  };
}

export default async function CandidateApplicationDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;

  const query = (await searchParams) ?? {};

  const context = await requireCandidate();

  const {
    application,
    documents,
    timeline,
  } = await getCandidateApplication(context, id);

  if (!application) {
    notFound();
  }

  const supabase = await createClient();

  const [
    { data: immigrationProfile },
    { data: progressRows },
    { data: addressRows },
    { data: dependantRows },
    { data: educationRows },
    { data: employmentRows },
    { data: languageRows },
    { data: licenseRows },
    { data: travelRows },
    { data: visaRows },
    { data: emergencyContactRows },
    { data: referenceRows },
    { data: financialInformation },
    { data: immigrationDeclarations },
  ] = await Promise.all([
    supabase
      .from(
        "application_immigration_profiles",
      )
      .select("*")
      .eq("application_id", id)
      .maybeSingle<ImmigrationProfile>(),

    supabase
      .from(
        "application_section_progress",
      )
      .select("section_key, status")
      .eq("application_id", id)
      .returns<ProgressRow[]>(),

    supabase
      .from("application_addresses")
      .select(
        `
        id,
        address_type,
        address_line_1,
        address_line_2,
        city,
        state_province,
        postal_code,
        country,
        from_date,
        to_date,
        is_current
        `,
      )
      .eq("application_id", id)
      .order("is_current", {
        ascending: false,
      })
      .order("from_date", {
        ascending: false,
      })
      .returns<AddressRow[]>(),

    supabase
      .from("application_dependants")
      .select(
        `
        id,
        full_name,
        relationship,
        date_of_birth,
        nationality,
        country_of_residence,
        passport_number,
        accompanying_applicant,
        visa_required
        `,
      )
      .eq("application_id", id)
      .order("created_at", {
        ascending: true,
      })
      .returns<DependantRow[]>(),

    supabase
      .from(
        "application_education_history",
      )
      .select(
        `
        id,
        institution_name,
        country,
        qualification,
        field_of_study,
        start_date,
        end_date,
        completed,
        graduation_date,
        certificate_available
        `,
      )
      .eq("application_id", id)
      .order("start_date", {
        ascending: false,
      })
      .returns<EducationRow[]>(),

    supabase
      .from(
        "application_employment_history",
      )
      .select(
        `
        id,
        employer_name,
        job_title,
        country,
        city,
        start_date,
        end_date,
        is_current,
        duties,
        reason_for_leaving,
        supervisor_name,
        supervisor_contact,
        reference_permission
        `,
      )
      .eq("application_id", id)
      .order("is_current", {
        ascending: false,
      })
      .order("start_date", {
        ascending: false,
      })
      .returns<EmploymentRow[]>(),

    supabase
      .from("application_languages")
      .select(
        `
        id,
        language,
        speaking_level,
        reading_level,
        writing_level,
        listening_level,
        test_name,
        test_score,
        test_date
        `,
      )
      .eq("application_id", id)
      .order("created_at", {
        ascending: true,
      })
      .returns<LanguageRow[]>(),

    supabase
      .from(
        "application_professional_licenses",
      )
      .select(
        `
        id,
        license_name,
        issuing_authority,
        license_number,
        country,
        issue_date,
        expiry_date
        `,
      )
      .eq("application_id", id)
      .order("issue_date", {
        ascending: false,
      })
      .returns<LicenseRow[]>(),

    supabase
      .from("application_travel_history")
      .select(
        `
        id,
        country,
        purpose,
        arrival_date,
        departure_date,
        visa_type
        `,
      )
      .eq("application_id", id)
      .order("arrival_date", {
        ascending: false,
      })
      .returns<TravelRow[]>(),
    supabase
      .from("application_visa_history")
      .select(
        `
        id,
        country,
        visa_type,
        application_date,
        decision,
        decision_date,
        visa_number,
        valid_from,
        valid_until,
        refusal_reason
        `,
      )
      .eq("application_id", id)
      .order("application_date", {
        ascending: false,
      })
      .returns<VisaRow[]>(),
    supabase
      .from("application_emergency_contacts")
      .select(
        `
        id,
        full_name,
        relationship,
        phone,
        alternate_phone,
        email,
        city,
        country
        `,
      )
      .eq("application_id", id)
      .order("created_at", {
        ascending: true,
      })
      .returns<EmergencyContactRow[]>(),
    supabase
      .from("application_references")
      .select(
        `
        id,
        full_name,
        relationship,
        organisation,
        job_title,
        phone,
        email,
        country,
        can_contact
        `,
      )
      .eq("application_id", id)
      .order("created_at", {
        ascending: true,
      })
      .returns<ReferenceRow[]>(),
    supabase
      .from("application_financial_information")
      .select(
        `
        application_id,
        funding_source,
        sponsor_name,
        sponsor_relationship,
        currency,
        available_funds,
        monthly_income,
        proof_of_funds_available,
        employer_sponsorship_expected,
        employer_covers_visa,
        employer_covers_flight,
        employer_covers_accommodation,
        employer_covers_medical,
        financial_notes
        `,
      )
      .eq("application_id", id)
      .maybeSingle<FinancialInformationRow>(),
    supabase
      .from("application_immigration_declarations")
      .select(
        `
        application_id,
        previous_visa_refusal,
        previous_visa_refusal_details,
        previous_overstay,
        previous_overstay_details,
        previous_deportation_or_removal,
        previous_deportation_details,
        immigration_violation,
        immigration_violation_details,
        criminal_charge_or_conviction,
        criminal_details,
        military_service,
        military_service_details,
        government_service,
        government_service_details,
        medical_disclosure_required,
        medical_disclosure_details,
        consent_to_data_processing,
        consent_to_employer_sharing,
        consent_to_authority_sharing,
        certify_true_and_complete,
        declaration_signed_name,
        declaration_signed_at
        `,
      )
      .eq("application_id", id)
      .maybeSingle<ImmigrationDeclarationsRow>(),
  ]);

  const profile = immigrationProfile ?? {};

  const addresses = addressRows ?? [];
  const dependants = dependantRows ?? [];
  const education = educationRows ?? [];
  const employment = employmentRows ?? [];
  const languages = languageRows ?? [];
  const licenses = licenseRows ?? [];
  const travel = travelRows ?? [];
  const visas = visaRows ?? [];
  const emergencyContacts = emergencyContactRows ?? [];
  const references = referenceRows ?? [];
  const finances = financialInformation ?? null;
  const declarations = immigrationDeclarations ?? null;
  const progressMap = new Map(
    (progressRows ?? []).map((row) => [
      row.section_key,
      row.status,
    ]),
  );

  const requestedSection =
    typeof query.section === "string"
      ? query.section
      : "personal";

  const section = SECTIONS.some(
    (item) =>
      item.key === requestedSection,
  )
    ? requestedSection
    : "personal";

  const saved =
    typeof query.saved === "string"
      ? query.saved
      : "";

  const job =
    application.job as Record<
      string,
      unknown
    > | null;

  const status = String(
    application.status ?? "draft",
  );

  const editable = ![
    "withdrawn",
    "rejected",
    "declined",
    "cancelled",
    "placed",
    "completed",
  ].includes(status.toLowerCase());

  const completedSections =
    SECTIONS.filter(
      (item) =>
        progressMap.get(item.key) ===
        "complete",
    ).length;

  const completion = Math.round(
    (completedSections / SECTIONS.length) *
      100,
  );

  const validLicenseCount =
    licenses.filter(
      (record) =>
        licenseStatus(record.expiry_date)
          .state === "valid",
    ).length;

  const expiredLicenseCount =
    licenses.filter(
      (record) =>
        licenseStatus(record.expiry_date)
          .state === "expired",
    ).length;

  const countriesVisited = new Set(
    travel
      .map((record) => record.country)
      .filter(Boolean),
  ).size;

  const ongoingTrips = travel.filter(
    (record) =>
      Boolean(record.arrival_date) &&
      !record.departure_date,
  ).length;

  return (
    <div className="space-y-7">
      <Link
        href="/candidate/applications"
        className="inline-flex items-center gap-2 text-sm font-bold text-[#071A3D] transition hover:text-[#B8860B]"
      >
        ← My Applications
      </Link>

      {/* HERO */}
      <section className="overflow-hidden rounded-3xl bg-[#071A3D] shadow-xl">
        <div className="relative px-6 py-8 sm:px-8 lg:px-10">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#D4AF37]/10 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="inline-flex rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#F2D675]">
                Immigration & Recruitment Case
              </span>

              <p className="mt-4 font-mono text-xs font-bold tracking-[0.14em] text-[#F2D675]">
                {caseReference(id)}
              </p>

              <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                {String(
                  job?.title ??
                    "Employment Application",
                )}
              </h1>

              <p className="mt-2 text-sm text-slate-300">
                {[job?.city, job?.country]
                  .filter(Boolean)
                  .join(", ") ||
                  "Destination not specified"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                Current Stage
              </p>

              <p className="mt-2 font-bold text-white">
                {candidateStatusLabel(
                  status,
                )}
              </p>

              <p className="mt-3 text-xs text-slate-400">
                Last updated
              </p>

              <p className="mt-1 text-sm font-semibold text-white">
                {dateText(
                  application.updated_at,
                )}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS */}
      {saved ? (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <p className="font-bold text-emerald-800">
            Information saved successfully.
          </p>

          <p className="mt-1 text-sm text-emerald-700">
            Your {titleCase(saved)}{" "}
            information has been recorded.
          </p>
        </section>
      ) : null}

      {/* COMPLETION */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Immigration File Completion
            </p>

            <p className="mt-2 text-3xl font-black text-[#071A3D]">
              {completion}%
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-sm font-bold text-[#071A3D]">
              {completedSections} of{" "}
              {SECTIONS.length} sections
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Completed sections are marked
              automatically.
            </p>
          </div>
        </div>

        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#D4AF37] transition-all"
            style={{
              width: `${completion}%`,
            }}
          />
        </div>
      </section>

      {/* NAVIGATION */}
      <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SECTIONS.map((item) => {
            const active =
              section === item.key;

            const complete =
              progressMap.get(item.key) ===
              "complete";

            const inProgress =
              progressMap.get(item.key) ===
              "in_progress";

            return (
              <Link
                key={item.key}
                href={`/candidate/applications/${id}?section=${item.key}`}
                className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                  active
                    ? "border-[#071A3D] bg-[#071A3D] text-white"
                    : complete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : inProgress
                        ? "border-amber-200 bg-amber-50 text-amber-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-[#D4AF37]"
                }`}
              >
                {complete ? "✓ " : ""}
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      {/* PERSONAL */}
      {section === "personal" ? (
        <SectionPanel
          title="Personal Information"
          subtitle="Enter your legal personal details exactly as they appear on your official records."
        >
          <Notice
            title="Legal identity information"
            text="Your names, date of birth, nationality and identity information should match your official documents."
          />

          <form
            action={saveCandidatePersonalInformation.bind(
              null,
              id,
            )}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Given Names"
                name="given_names"
                defaultValue={value(
                  profile.given_names,
                )}
                required
              />

              <Input
                label="Family / Surname"
                name="family_name"
                defaultValue={value(
                  profile.family_name,
                )}
                required
              />

              <Input
                label="Other Names"
                name="other_names"
                defaultValue={value(
                  profile.other_names,
                )}
              />

              <Input
                label="Previous Names"
                name="previous_names"
                defaultValue={value(
                  profile.previous_names,
                )}
              />

              <Select
                label="Sex"
                name="sex"
                defaultValue={value(
                  profile.sex,
                )}
                required
                options={[
                  "Male",
                  "Female",
                  "Other",
                  "Prefer not to say",
                ]}
              />

              <Input
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                defaultValue={value(
                  profile.date_of_birth,
                )}
                required
              />

              <Input
                label="Place of Birth"
                name="place_of_birth"
                defaultValue={value(
                  profile.place_of_birth,
                )}
              />

              <Input
                label="Country of Birth"
                name="country_of_birth"
                defaultValue={value(
                  profile.country_of_birth,
                )}
              />

              <Input
                label="Nationality"
                name="nationality"
                defaultValue={value(
                  profile.nationality,
                )}
                required
              />

              <Input
                label="Other Citizenship(s)"
                name="other_citizenships"
                defaultValue={
                  profile.other_citizenships?.join(
                    ", ",
                  ) ?? ""
                }
              />

              <Select
                label="Marital Status"
                name="marital_status"
                defaultValue={value(
                  profile.marital_status,
                )}
                options={[
                  "Single",
                  "Married",
                  "Divorced",
                  "Widowed",
                  "Separated",
                  "Common-law",
                ]}
              />

              <Input
                label="National ID Number"
                name="national_id_number"
                defaultValue={value(
                  profile.national_id_number,
                )}
              />

              <Input
                label="Country of Residence"
                name="residence_country"
                defaultValue={value(
                  profile.residence_country,
                )}
              />

              <Input
                label="Residence Status"
                name="residence_status"
                defaultValue={value(
                  profile.residence_status,
                )}
              />

              <Input
                label="Primary Phone"
                name="primary_phone"
                type="tel"
                defaultValue={value(
                  profile.primary_phone,
                )}
              />

              <Input
                label="Primary Email"
                name="primary_email"
                type="email"
                defaultValue={value(
                  profile.primary_email,
                )}
              />

              <Input
                label="Preferred Language"
                name="preferred_language"
                defaultValue={value(
                  profile.preferred_language,
                )}
              />

              <Input
                label="Number of Dependants"
                name="dependants_count"
                type="number"
                min="0"
                defaultValue={value(
                  profile.dependants_count ??
                    0,
                )}
              />
            </div>

            <CheckboxCard
              name="has_dependants"
              title="I have dependants"
              text="Dependants may include a spouse, children or other qualifying family members."
              defaultChecked={
                profile.has_dependants ??
                false
              }
            />

            <SaveButton
              label="Save & Continue to Passport"
              disabled={!editable}
            />
          </form>
        </SectionPanel>
      ) : null}

      {/* PASSPORT */}
      {section === "passport" ? (
        <SectionPanel
          title="Passport Information"
          subtitle="Enter details from the passport you intend to use."
        >
          <Warning
            title="Passport accuracy is important"
            text="Passport number, issuing country and dates should match your physical passport exactly."
          />

          <form
            action={saveCandidatePassportInformation.bind(
              null,
              id,
            )}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Passport Number"
                name="passport_number"
                defaultValue={value(
                  profile.passport_number,
                )}
                required
              />

              <Input
                label="Issuing Country"
                name="passport_issue_country"
                defaultValue={value(
                  profile.passport_issue_country,
                )}
                required
              />

              <Input
                label="Issue Date"
                name="passport_issue_date"
                type="date"
                defaultValue={value(
                  profile.passport_issue_date,
                )}
                required
              />

              <Input
                label="Expiry Date"
                name="passport_expiry_date"
                type="date"
                defaultValue={value(
                  profile.passport_expiry_date,
                )}
                required
              />
            </div>

            <SaveButton
              label="Save & Continue to Addresses"
              disabled={!editable}
            />
          </form>
        </SectionPanel>
      ) : null}

      {/* ADDRESSES */}
      {section === "addresses" ? (
        <SectionPanel
          title="Address History"
          subtitle="Provide your current and relevant previous residential addresses."
        >
          <Notice
            title="Address history"
            text="Start with your current residential address and add previous addresses where required."
          />

          <SectionHeading
            title="Recorded Addresses"
            subtitle={`${addresses.length} address record${
              addresses.length === 1
                ? ""
                : "s"
            }`}
          />

          <div className="space-y-3">
            {addresses.map((address) => (
              <article
                key={address.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <p className="font-black text-[#071A3D]">
                        {titleCase(
                          address.address_type ??
                            "residential",
                        )}
                      </p>

                      {address.is_current ? (
                        <SuccessBadge text="Current Address" />
                      ) : null}
                    </div>

                    <p className="mt-3 text-sm font-semibold">
                      {[
                        address.address_line_1,
                        address.address_line_2,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {[
                        address.city,
                        address.state_province,
                        address.postal_code,
                        address.country,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      {dateText(
                        address.from_date,
                      )}{" "}
                      →{" "}
                      {address.is_current
                        ? "Present"
                        : dateText(
                            address.to_date,
                          )}
                    </p>
                  </div>

                  {editable ? (
                    <form
                      action={deleteCandidateAddress.bind(
                        null,
                        id,
                        address.id,
                      )}
                    >
                      <RemoveButton />
                    </form>
                  ) : null}
                </div>
              </article>
            ))}

            {!addresses.length ? (
              <EmptyState
                title="No addresses recorded"
                text="Add your current residential address below."
              />
            ) : null}
          </div>

          <Divider />

          <SectionHeading
            title="Add Address"
            subtitle="Add one address at a time."
          />

          <form
            action={addCandidateAddress.bind(
              null,
              id,
            )}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Select
                label="Address Type"
                name="address_type"
                defaultValue="Residential"
                options={[
                  "Residential",
                  "Mailing",
                  "Temporary",
                  "Previous Residence",
                ]}
              />

              <Input
                label="Address Line 1"
                name="address_line_1"
                required
              />

              <Input
                label="Address Line 2"
                name="address_line_2"
              />

              <Input
                label="City / Town"
                name="city"
                required
              />

              <Input
                label="State / Province / County"
                name="state_province"
              />

              <Input
                label="Postal Code"
                name="postal_code"
              />

              <Input
                label="Country"
                name="country"
                required
              />

              <Input
                label="From Date"
                name="from_date"
                type="date"
                required
              />

              <Input
                label="To Date"
                name="to_date"
                type="date"
              />
            </div>

            <CheckboxCard
              name="is_current"
              title="This is my current residential address"
              text="An end date is not required for your current address."
            />

            <SaveButton
              label="Add Address"
              disabled={!editable}
            />
          </form>

          <Divider />

          <CompletionBox
            title="Finished with Address History?"
            text="Confirm that your current address is listed before continuing."
          >
            <form
              action={completeCandidateAddressSection.bind(
                null,
                id,
              )}
            >
              <SaveButton
                label="Complete Addresses & Continue to Family"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}

      {/* FAMILY */}
      {section === "family" ? (
        <SectionPanel
          title="Family & Dependants"
          subtitle="Record family members relevant to your immigration case."
        >
          <Notice
            title="Family information"
            text="Provide accurate information about dependants who may need to be declared."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat
              label="Declared Dependants"
              value={String(
                profile.dependants_count ??
                  dependants.length,
              )}
            />

            <MiniStat
              label="Records Added"
              value={String(
                dependants.length,
              )}
            />

            <MiniStat
              label="Accompanying"
              value={String(
                dependants.filter(
                  (item) =>
                    item.accompanying_applicant,
                ).length,
              )}
            />
          </div>

          <SectionHeading
            title="Recorded Family Members"
            subtitle={`${dependants.length} record${
              dependants.length === 1
                ? ""
                : "s"
            }`}
          />

          <div className="space-y-3">
            {dependants.map((dependant) => (
              <article
                key={dependant.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black text-[#071A3D]">
                        {dependant.full_name}
                      </p>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                        {titleCase(
                          dependant.relationship,
                        )}
                      </span>

                      {dependant.accompanying_applicant ? (
                        <SuccessBadge text="Accompanying" />
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <SmallDetail
                        label="Date of Birth"
                        value={dateText(
                          dependant.date_of_birth,
                        )}
                      />

                      <SmallDetail
                        label="Nationality"
                        value={
                          dependant.nationality ??
                          "Not recorded"
                        }
                      />

                      <SmallDetail
                        label="Residence"
                        value={
                          dependant.country_of_residence ??
                          "Not recorded"
                        }
                      />

                      <SmallDetail
                        label="Visa Required"
                        value={yesNoUnknown(
                          dependant.visa_required,
                        )}
                      />
                    </div>
                  </div>

                  {editable ? (
                    <form
                      action={deleteCandidateDependant.bind(
                        null,
                        id,
                        dependant.id,
                      )}
                    >
                      <RemoveButton />
                    </form>
                  ) : null}
                </div>
              </article>
            ))}

            {!dependants.length ? (
              <EmptyState
                title="No dependant records"
                text="Add family members where applicable, or complete the section if you have no dependants."
              />
            ) : null}
          </div>

          <Divider />

          <SectionHeading
            title="Add Family Member / Dependant"
            subtitle="Add one person at a time."
          />

          <form
            action={addCandidateDependant.bind(
              null,
              id,
            )}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Full Legal Name"
                name="full_name"
                required
              />

              <Select
                label="Relationship"
                name="relationship"
                required
                options={[
                  "Spouse",
                  "Partner",
                  "Son",
                  "Daughter",
                  "Child",
                  "Mother",
                  "Father",
                  "Brother",
                  "Sister",
                  "Other",
                ]}
              />

              <Input
                label="Date of Birth"
                name="date_of_birth"
                type="date"
              />

              <Input
                label="Nationality"
                name="nationality"
              />

              <Input
                label="Country of Residence"
                name="country_of_residence"
              />

              <Input
                label="Passport Number"
                name="passport_number"
              />

              <Select
                label="Visa Required"
                name="visa_required"
                options={[
                  "Yes",
                  "No",
                ]}
              />
            </div>

            <CheckboxCard
              name="accompanying_applicant"
              title="This dependant intends to accompany me"
              text="Eligibility depends on the relevant immigration program."
            />

            <SaveButton
              label="Add Family Member"
              disabled={!editable}
            />
          </form>

          <Divider />

          <CompletionBox
            title="Finished with Family Information?"
            text="Confirm that all required dependants have been recorded."
          >
            <form
              action={completeCandidateFamilySection.bind(
                null,
                id,
              )}
            >
              <SaveButton
                label="Complete Family & Continue to Education"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}

      {/* EDUCATION */}
      {section === "education" ? (
        <SectionPanel
          title="Education & Qualifications"
          subtitle="Record schools, colleges, universities, vocational training and qualifications."
        >
          <Notice
            title="Education history"
            text="Qualifications used to support an application should be backed by genuine certificates or transcripts where required."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat
              label="Education Records"
              value={String(
                education.length,
              )}
            />

            <MiniStat
              label="Completed"
              value={String(
                education.filter(
                  (item) =>
                    item.completed,
                ).length,
              )}
            />

            <MiniStat
              label="Certificates Available"
              value={String(
                education.filter(
                  (item) =>
                    item.certificate_available,
                ).length,
              )}
            />
          </div>

          <SectionHeading
            title="Education History"
            subtitle={`${education.length} education record${
              education.length === 1
                ? ""
                : "s"
            }`}
          />

          <div className="space-y-3">
            {education.map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black text-[#071A3D]">
                        {
                          record.institution_name
                        }
                      </p>

                      {record.completed ? (
                        <SuccessBadge text="Completed" />
                      ) : (
                        <PendingBadge text="Ongoing / Not Completed" />
                      )}
                    </div>

                    <p className="mt-2 text-sm font-semibold text-slate-700">
                      {record.qualification ??
                        "Qualification not recorded"}
                    </p>

                    {record.field_of_study ? (
                      <p className="mt-1 text-sm text-slate-600">
                        {
                          record.field_of_study
                        }
                      </p>
                    ) : null}

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <SmallDetail
                        label="Country"
                        value={
                          record.country ??
                          "Not recorded"
                        }
                      />

                      <SmallDetail
                        label="Started"
                        value={dateText(
                          record.start_date,
                        )}
                      />

                      <SmallDetail
                        label="Finished"
                        value={dateText(
                          record.end_date,
                        )}
                      />

                      <SmallDetail
                        label="Certificate"
                        value={
                          record.certificate_available
                            ? "Available"
                            : "Not indicated"
                        }
                      />
                    </div>
                  </div>

                  {editable ? (
                    <form
                      action={deleteCandidateEducation.bind(
                        null,
                        id,
                        record.id,
                      )}
                    >
                      <RemoveButton />
                    </form>
                  ) : null}
                </div>
              </article>
            ))}

            {!education.length ? (
              <EmptyState
                title="No education records"
                text="Add your education and training history below."
              />
            ) : null}
          </div>

          <Divider />

          <SectionHeading
            title="Add Education Record"
            subtitle="Add one institution at a time."
          />

          <form
            action={addCandidateEducation.bind(
              null,
              id,
            )}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Institution Name"
                name="institution_name"
                required
              />

              <Input
                label="Country"
                name="country"
              />

              <Input
                label="Qualification"
                name="qualification"
              />

              <Input
                label="Field of Study"
                name="field_of_study"
              />

              <Input
                label="Start Date"
                name="start_date"
                type="date"
                required
              />

              <Input
                label="End Date"
                name="end_date"
                type="date"
              />

              <Input
                label="Graduation Date"
                name="graduation_date"
                type="date"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <CheckboxCard
                name="completed"
                title="Qualification completed"
                text="Select this if you successfully completed this course."
              />

              <CheckboxCard
                name="certificate_available"
                title="Certificate available"
                text="Select this if you have supporting educational evidence."
              />
            </div>

            <SaveButton
              label="Add Education Record"
              disabled={!editable}
            />
          </form>

          <Divider />

          <CompletionBox
            title="Finished with Education?"
            text="Review your qualifications before continuing."
          >
            <form
              action={completeCandidateEducationSection.bind(
                null,
                id,
              )}
            >
              <SaveButton
                label="Complete Education & Continue to Employment"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}

      {/* EMPLOYMENT */}
      {section === "employment" ? (
        <SectionPanel
          title="Employment History"
          subtitle="Provide your current and previous employment history."
        >
          <Notice
            title="Employment history"
            text="Use accurate employer names, job titles and dates. Employment claims may require genuine supporting evidence."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat
              label="Employment Records"
              value={String(
                employment.length,
              )}
            />

            <MiniStat
              label="Current Positions"
              value={String(
                employment.filter(
                  (record) =>
                    record.is_current,
                ).length,
              )}
            />

            <MiniStat
              label="Reference Permission"
              value={String(
                employment.filter(
                  (record) =>
                    record.reference_permission,
                ).length,
              )}
            />
          </div>

          <SectionHeading
            title="Employment Records"
            subtitle={`${employment.length} employment record${
              employment.length === 1
                ? ""
                : "s"
            }`}
          />

          <div className="space-y-4">
            {employment.map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black text-[#071A3D]">
                        {record.job_title}
                      </p>

                      {record.is_current ? (
                        <SuccessBadge text="Current Employment" />
                      ) : null}

                      {record.reference_permission ? (
                        <InfoBadge text="Reference Contact Allowed" />
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm font-bold text-slate-700">
                      {record.employer_name}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      {[
                        record.city,
                        record.country,
                      ]
                        .filter(Boolean)
                        .join(", ") ||
                        "Location not recorded"}
                    </p>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <SmallDetail
                        label="Start Date"
                        value={dateText(
                          record.start_date,
                        )}
                      />

                      <SmallDetail
                        label="End Date"
                        value={
                          record.is_current
                            ? "Present"
                            : dateText(
                                record.end_date,
                              )
                        }
                      />

                      <SmallDetail
                        label="Supervisor"
                        value={
                          record.supervisor_name ??
                          "Not recorded"
                        }
                      />

                      <SmallDetail
                        label="Reference Contact"
                        value={
                          record.reference_permission
                            ? "Permitted"
                            : "Not permitted"
                        }
                      />
                    </div>

                    {record.duties ? (
                      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Main Duties
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {record.duties}
                        </p>
                      </div>
                    ) : null}

                    {!record.is_current &&
                    record.reason_for_leaving ? (
                      <div className="mt-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          Reason for Leaving
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {
                            record.reason_for_leaving
                          }
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {editable ? (
                    <form
                      action={deleteCandidateEmployment.bind(
                        null,
                        id,
                        record.id,
                      )}
                    >
                      <RemoveButton />
                    </form>
                  ) : null}
                </div>
              </article>
            ))}

            {!employment.length ? (
              <EmptyState
                title="No employment records"
                text="Add employment history below, or declare that you have no employment history when completing the section."
              />
            ) : null}
          </div>

          <Divider />

          <SectionHeading
            title="Add Employment Record"
            subtitle="Add one employer or position at a time."
          />

          <form
            action={addCandidateEmployment.bind(
              null,
              id,
            )}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Employer Name"
                name="employer_name"
                required
              />

              <Input
                label="Job Title"
                name="job_title"
                required
              />

              <Input
                label="Country"
                name="country"
              />

              <Input
                label="City / Town"
                name="city"
              />

              <Input
                label="Employment Start Date"
                name="start_date"
                type="date"
                required
              />

              <Input
                label="Employment End Date"
                name="end_date"
                type="date"
              />

              <Input
                label="Supervisor / Manager Name"
                name="supervisor_name"
              />

              <Input
                label="Supervisor / Reference Contact"
                name="supervisor_contact"
                placeholder="Phone or email"
              />
            </div>

            <TextArea
              label="Main Duties & Responsibilities"
              name="duties"
              rows={5}
            />

            <TextArea
              label="Reason for Leaving"
              name="reason_for_leaving"
              rows={3}
            />

            <div className="grid gap-4 md:grid-cols-2">
              <CheckboxCard
                name="is_current"
                title="I currently work here"
                text="An employment end date is not required for current employment."
              />

              <CheckboxCard
                name="reference_permission"
                title="Permission to contact this employer"
                text="Authorised staff may contact this employer or supervisor where appropriate."
              />
            </div>

            <SaveButton
              label="Add Employment Record"
              disabled={!editable}
            />
          </form>

          <Divider />

          <CompletionBox
            title="Finished with Employment History?"
            text="Review your employment records before continuing."
          >
            <form
              action={completeCandidateEmploymentSection.bind(
                null,
                id,
              )}
              className="space-y-4"
            >
              {employment.length === 0 ? (
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <input
                    type="checkbox"
                    name="no_employment_history"
                    value="yes"
                    className="mt-1 h-4 w-4"
                  />

                  <span>
                    <span className="block text-sm font-bold text-[#071A3D]">
                      I have no previous
                      employment history
                    </span>

                    <span className="mt-1 block text-xs text-slate-500">
                      Select this only if you
                      have no employment
                      history that should be
                      declared.
                    </span>
                  </span>
                </label>
              ) : null}

              <SaveButton
                label="Complete Employment & Continue to Languages"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}

      {/* LANGUAGES */}
      {section === "languages" ? (
        <SectionPanel
          title="Languages & Language Tests"
          subtitle="Record the languages you speak and any recognised language test results."
        >
          <Notice
            title="Language ability"
            text="Assess your speaking, reading, writing and listening ability accurately. Only enter genuine formal test results."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat
              label="Languages Recorded"
              value={String(
                languages.length,
              )}
            />

            <MiniStat
              label="Formal Tests"
              value={String(
                languages.filter(
                  (record) =>
                    record.test_name,
                ).length,
              )}
            />

            <MiniStat
              label="Native Languages"
              value={String(
                languages.filter(
                  (record) =>
                    record.speaking_level ===
                      "Native" ||
                    record.reading_level ===
                      "Native" ||
                    record.writing_level ===
                      "Native" ||
                    record.listening_level ===
                      "Native",
                ).length,
              )}
            />
          </div>

          <SectionHeading
            title="Recorded Languages"
            subtitle={`${languages.length} language record${
              languages.length === 1
                ? ""
                : "s"
            }`}
          />

          <div className="space-y-4">
            {languages.map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black text-[#071A3D]">
                        {record.language}
                      </p>

                      {record.test_name ? (
                        <InfoBadge
                          text={
                            record.test_name
                          }
                        />
                      ) : null}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <LanguageSkill
                        label="Speaking"
                        level={
                          record.speaking_level ??
                          "Not recorded"
                        }
                      />

                      <LanguageSkill
                        label="Reading"
                        level={
                          record.reading_level ??
                          "Not recorded"
                        }
                      />

                      <LanguageSkill
                        label="Writing"
                        level={
                          record.writing_level ??
                          "Not recorded"
                        }
                      />

                      <LanguageSkill
                        label="Listening"
                        level={
                          record.listening_level ??
                          "Not recorded"
                        }
                      />
                    </div>

                    {record.test_name ||
                    record.test_score ||
                    record.test_date ? (
                      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
                          Language Test
                        </p>

                        <div className="mt-3 grid gap-4 sm:grid-cols-3">
                          <SmallDetail
                            label="Test"
                            value={
                              record.test_name ??
                              "Not recorded"
                            }
                          />

                          <SmallDetail
                            label="Score / Result"
                            value={
                              record.test_score ??
                              "Not recorded"
                            }
                          />

                          <SmallDetail
                            label="Test Date"
                            value={dateText(
                              record.test_date,
                            )}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {editable ? (
                    <form
                      action={deleteCandidateLanguage.bind(
                        null,
                        id,
                        record.id,
                      )}
                    >
                      <RemoveButton />
                    </form>
                  ) : null}
                </div>
              </article>
            ))}

            {!languages.length ? (
              <EmptyState
                title="No languages recorded"
                text="Add at least one language before completing this section."
              />
            ) : null}
          </div>

          <Divider />

          <SectionHeading
            title="Add Language"
            subtitle="Add one language at a time and assess each communication skill separately."
          />

          <form
            action={addCandidateLanguage.bind(
              null,
              id,
            )}
            className="space-y-6"
          >
            <Input
              label="Language"
              name="language"
              placeholder="English, Kiswahili, French, German..."
              required
            />

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <Select
                label="Speaking Level"
                name="speaking_level"
                options={
                  LANGUAGE_LEVELS
                }
                required
              />

              <Select
                label="Reading Level"
                name="reading_level"
                options={
                  LANGUAGE_LEVELS
                }
                required
              />

              <Select
                label="Writing Level"
                name="writing_level"
                options={
                  LANGUAGE_LEVELS
                }
                required
              />

              <Select
                label="Listening Level"
                name="listening_level"
                options={
                  LANGUAGE_LEVELS
                }
                required
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h4 className="font-black text-[#071A3D]">
                Formal Language Test
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Leave these fields blank if
                you have not taken a formal
                language test.
              </p>

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <Input
                  label="Test Name"
                  name="test_name"
                  placeholder="IELTS, PTE, CELPIP, TOEFL..."
                />

                <Input
                  label="Score / Result"
                  name="test_score"
                  placeholder="Example: Overall 7.0"
                />

                <Input
                  label="Test Date"
                  name="test_date"
                  type="date"
                />
              </div>
            </div>

            <SaveButton
              label="Add Language"
              disabled={!editable}
            />
          </form>

          <Divider />

          <CompletionBox
            title="Finished with Languages?"
            text="Confirm that your language ability is accurately recorded."
          >
            <form
              action={completeCandidateLanguagesSection.bind(
                null,
                id,
              )}
            >
              <SaveButton
                label="Complete Languages & Continue to Licences"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}

      {/* LICENCES */}
      {section === "licenses" ? (
        <SectionPanel
          title="Professional Licences & Certifications"
          subtitle="Record professional licences, registrations, trade certificates and certifications relevant to your occupation."
        >
          <Notice
            title="Professional credentials"
            text="Only enter genuine credentials issued by recognised authorities, professional bodies or legitimate institutions."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat
              label="Credentials Recorded"
              value={String(
                licenses.length,
              )}
            />

            <MiniStat
              label="Currently Valid"
              value={String(
                validLicenseCount,
              )}
            />

            <MiniStat
              label="Expired"
              value={String(
                expiredLicenseCount,
              )}
            />
          </div>

          <SectionHeading
            title="Recorded Credentials"
            subtitle={`${licenses.length} credential record${
              licenses.length === 1
                ? ""
                : "s"
            }`}
          />

          <div className="space-y-4">
            {licenses.map((record) => {
              const credentialStatus =
                licenseStatus(
                  record.expiry_date,
                );

              return (
                <article
                  key={record.id}
                  className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-black text-[#071A3D]">
                          {
                            record.license_name
                          }
                        </p>

                        {credentialStatus.state ===
                        "valid" ? (
                          <SuccessBadge text="Valid" />
                        ) : credentialStatus.state ===
                          "expired" ? (
                          <ExpiredBadge text="Expired" />
                        ) : (
                          <NeutralBadge text="No Expiry Date" />
                        )}
                      </div>

                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {record.issuing_authority ??
                          "Issuing authority not recorded"}
                      </p>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <SmallDetail
                          label="Number"
                          value={
                            record.license_number ??
                            "Not recorded"
                          }
                        />

                        <SmallDetail
                          label="Country"
                          value={
                            record.country ??
                            "Not recorded"
                          }
                        />

                        <SmallDetail
                          label="Issue Date"
                          value={dateText(
                            record.issue_date,
                          )}
                        />

                        <SmallDetail
                          label="Expiry Date"
                          value={
                            record.expiry_date
                              ? dateText(
                                  record.expiry_date,
                                )
                              : "No expiry recorded"
                          }
                        />
                      </div>
                    </div>

                    {editable ? (
                      <form
                        action={deleteCandidateProfessionalLicense.bind(
                          null,
                          id,
                          record.id,
                        )}
                      >
                        <RemoveButton />
                      </form>
                    ) : null}
                  </div>
                </article>
              );
            })}

            {!licenses.length ? (
              <EmptyState
                title="No professional credentials recorded"
                text="Add relevant licences or certifications below, or declare that you have none."
              />
            ) : null}
          </div>

          <Divider />

          <SectionHeading
            title="Add Licence or Certification"
            subtitle="Add one professional credential at a time."
          />

          <form
            action={addCandidateProfessionalLicense.bind(
              null,
              id,
            )}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Licence / Certification Name"
                name="license_name"
                required
              />

              <Input
                label="Issuing Authority"
                name="issuing_authority"
              />

              <Input
                label="Licence / Certificate Number"
                name="license_number"
              />

              <Input
                label="Country of Issue"
                name="country"
              />

              <Input
                label="Issue Date"
                name="issue_date"
                type="date"
              />

              <Input
                label="Expiry Date"
                name="expiry_date"
                type="date"
              />
            </div>

            <SaveButton
              label="Add Professional Credential"
              disabled={!editable}
            />
          </form>

          <Divider />

          <CompletionBox
            title="Finished with Professional Licences?"
            text="Review your credentials before continuing."
          >
            <form
              action={completeCandidateLicensesSection.bind(
                null,
                id,
              )}
              className="space-y-4"
            >
              {licenses.length === 0 ? (
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <input
                    type="checkbox"
                    name="no_professional_licenses"
                    value="yes"
                    className="mt-1 h-4 w-4"
                  />

                  <span className="text-sm font-bold text-[#071A3D]">
                    I have no professional
                    licences or certifications
                    to declare
                  </span>
                </label>
              ) : null}

              <SaveButton
                label="Complete Licences & Continue to Travel History"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}

      {/* TRAVEL HISTORY */}
      {section === "travel" ? (
        <SectionPanel
          title="International Travel History"
          subtitle="Record previous international travel relevant to your immigration case."
        >
          <Notice
            title="Travel history"
            text="Enter previous international trips accurately using passport stamps, visas or other travel records where available. Requirements and look-back periods vary by immigration program."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat
              label="Trips Recorded"
              value={String(
                travel.length,
              )}
            />

            <MiniStat
              label="Countries Visited"
              value={String(
                countriesVisited,
              )}
            />

            <MiniStat
              label="No Departure Recorded"
              value={String(
                ongoingTrips,
              )}
            />
          </div>

          <SectionHeading
            title="Recorded International Travel"
            subtitle={`${travel.length} trip${
              travel.length === 1
                ? ""
                : "s"
            } recorded`}
          />

          <div className="space-y-4">
            {travel.map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black text-[#071A3D]">
                        {record.country}
                      </p>

                      {!record.departure_date ? (
                        <PendingBadge text="No Departure Recorded" />
                      ) : (
                        <SuccessBadge text="Completed Trip" />
                      )}

                      {record.visa_type ? (
                        <InfoBadge
                          text={
                            record.visa_type
                          }
                        />
                      ) : null}
                    </div>

                    {record.purpose ? (
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        {record.purpose}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-slate-500">
                        Purpose not recorded
                      </p>
                    )}

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <SmallDetail
                        label="Country"
                        value={record.country}
                      />

                      <SmallDetail
                        label="Arrival Date"
                        value={dateText(
                          record.arrival_date,
                        )}
                      />

                      <SmallDetail
                        label="Departure Date"
                        value={
                          record.departure_date
                            ? dateText(
                                record.departure_date,
                              )
                            : "Not recorded"
                        }
                      />

                      <SmallDetail
                        label="Visa / Entry Type"
                        value={
                          record.visa_type ??
                          "Not recorded"
                        }
                      />
                    </div>
                  </div>

                  {editable ? (
                    <form
                      action={deleteCandidateTravelHistory.bind(
                        null,
                        id,
                        record.id,
                      )}
                    >
                      <RemoveButton />
                    </form>
                  ) : null}
                </div>
              </article>
            ))}

            {!travel.length ? (
              <EmptyState
                title="No international travel recorded"
                text="Add previous international trips below. If you have never travelled internationally, you can make that declaration when completing this section."
              />
            ) : null}
          </div>

          <Divider />

          <SectionHeading
            title="Add International Trip"
            subtitle="Add one visit to another country at a time."
          />

          <form
            action={addCandidateTravelHistory.bind(
              null,
              id,
            )}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Country Visited"
                name="country"
                placeholder="Example: United Arab Emirates"
                required
              />

              <Input
                label="Purpose of Travel"
                name="purpose"
                placeholder="Tourism, work, study, family visit, business..."
              />

              <Input
                label="Arrival / Entry Date"
                name="arrival_date"
                type="date"
                required
              />

              <Input
                label="Departure / Exit Date"
                name="departure_date"
                type="date"
              />

              <Input
                label="Visa / Entry Type"
                name="visa_type"
                placeholder="Visitor visa, work visa, student visa, visa-free..."
              />
            </div>

            <Warning
              title="Travel dates must be accurate"
              text="Departure cannot be before arrival, and travel-history dates cannot be in the future. Leave the departure date blank only where there is genuinely no departure date to record yet."
            />

            <SaveButton
              label="Add Travel Record"
              disabled={!editable}
            />
          </form>

          <Divider />

          <CompletionBox
            title="Finished with Travel History?"
            text="Review your international travel records before continuing to visa and immigration history."
          >
            <form
              action={completeCandidateTravelSection.bind(
                null,
                id,
              )}
              className="space-y-4"
            >
              {travel.length === 0 ? (
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <input
                    type="checkbox"
                    name="no_travel_history"
                    value="yes"
                    className="mt-1 h-4 w-4"
                  />

                  <span>
                    <span className="block text-sm font-bold text-[#071A3D]">
                      I have no international
                      travel history
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Select this only if you
                      have never travelled
                      internationally during
                      the period relevant to
                      your application.
                    </span>
                  </span>
                </label>
              ) : null}

              <SaveButton
                label="Complete Travel History & Continue to Visa History"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}

      {/* VISA HISTORY */}
      {section === "visas" ? (
        <SectionPanel
          title="Visa & Immigration History"
          subtitle="Record previous visa applications and decisions."
        >
          <Warning
            title="Declare visa history accurately"
            text="Previous refusals should be recorded truthfully. Final immigration decisions remain with the relevant authority."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat label="Visa Records" value={String(visas.length)} />
            <MiniStat
              label="Approved / Granted"
              value={String(
                visas.filter((r) =>
                  ["approved", "granted", "issued"].includes(
                    String(r.decision ?? "").toLowerCase(),
                  ),
                ).length,
              )}
            />
            <MiniStat
              label="Refused"
              value={String(
                visas.filter(
                  (r) =>
                    String(r.decision ?? "").toLowerCase() === "refused",
                ).length,
              )}
            />
          </div>

          <div className="space-y-4">
            {visas.map((record) => (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-[#071A3D]">
                        {record.country}
                      </p>
                      {String(record.decision ?? "").toLowerCase() === "refused" ? (
                        <ExpiredBadge text="Refused" />
                      ) : record.decision ? (
                        <InfoBadge text={titleCase(record.decision)} />
                      ) : (
                        <NeutralBadge text="No Decision" />
                      )}
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <SmallDetail label="Visa Type" value={record.visa_type ?? "Not recorded"} />
                      <SmallDetail label="Application Date" value={dateText(record.application_date)} />
                      <SmallDetail label="Decision Date" value={dateText(record.decision_date)} />
                      <SmallDetail label="Visa Number" value={record.visa_number ?? "Not recorded"} />
                      <SmallDetail label="Valid From" value={dateText(record.valid_from)} />
                      <SmallDetail label="Valid Until" value={dateText(record.valid_until)} />
                    </div>

                    {record.refusal_reason ? (
                      <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
                        <strong>Refusal reason:</strong> {record.refusal_reason}
                      </p>
                    ) : null}
                  </div>

                  {editable ? (
                    <form
                      action={deleteCandidateVisaHistory.bind(null, id, record.id)}
                    >
                      <RemoveButton />
                    </form>
                  ) : null}
                </div>
              </article>
            ))}

            {!visas.length ? (
              <EmptyState
                title="No visa history recorded"
                text="Add previous visa applications below, or confirm that you have none to declare."
              />
            ) : null}
          </div>

          <Divider />

          <SectionHeading
            title="Add Visa History Record"
            subtitle="Add one visa application or visa record at a time."
          />

          <form
            action={addCandidateVisaHistory.bind(null, id)}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input label="Country" name="country" required />
              <Input label="Visa Type" name="visa_type" />
              <Input label="Application Date" name="application_date" type="date" />
              <Select
                label="Decision"
                name="decision"
                options={["Approved","Granted","Issued","Refused","Pending","Withdrawn","Cancelled"]}
              />
              <Input label="Decision Date" name="decision_date" type="date" />
              <Input label="Visa Number" name="visa_number" />
              <Input label="Valid From" name="valid_from" type="date" />
              <Input label="Valid Until" name="valid_until" type="date" />
            </div>

            <TextArea
              label="Refusal Reason"
              name="refusal_reason"
              rows={4}
              placeholder="Required if the visa application was refused."
            />

            <SaveButton label="Add Visa History Record" disabled={!editable} />
          </form>

          <Divider />

          <CompletionBox
            title="Finished with Visa History?"
            text="Review your records before continuing."
          >
            <form
              action={completeCandidateVisaSection.bind(null, id)}
              className="space-y-4"
            >
              {visas.length === 0 ? (
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <input
                    type="checkbox"
                    name="no_visa_history"
                    value="yes"
                    className="mt-1 h-4 w-4"
                  />
                  <span className="text-sm font-bold text-[#071A3D]">
                    I have no previous visa history to declare
                  </span>
                </label>
              ) : null}

              <SaveButton
                label="Complete Visa History & Continue to Emergency Contact"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}

      {/* EMERGENCY CONTACT */}
      {section === "emergency" ? (
        <SectionPanel
          title="Emergency Contact"
          subtitle="Provide at least one trusted person who can be contacted if necessary during your recruitment or immigration process."
        >
          <Notice
            title="Emergency contact information"
            text="Use current and accurate contact details. This information should belong to someone you trust and who can be reached when necessary."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat
              label="Contacts Recorded"
              value={String(emergencyContacts.length)}
            />

            <MiniStat
              label="With Email"
              value={String(
                emergencyContacts.filter(
                  (contact) => Boolean(contact.email),
                ).length,
              )}
            />

            <MiniStat
              label="With Alternate Phone"
              value={String(
                emergencyContacts.filter(
                  (contact) => Boolean(contact.alternate_phone),
                ).length,
              )}
            />
          </div>

          <SectionHeading
            title="Recorded Emergency Contacts"
            subtitle={`${emergencyContacts.length} contact record${
              emergencyContacts.length === 1 ? "" : "s"
            }`}
          />

          <div className="space-y-4">
            {emergencyContacts.map((contact) => (
              <article
                key={contact.id}
                className="rounded-2xl border border-slate-200 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black text-[#071A3D]">
                        {contact.full_name}
                      </p>

                      {contact.relationship ? (
                        <InfoBadge text={contact.relationship} />
                      ) : null}
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <SmallDetail
                        label="Primary Phone"
                        value={contact.phone}
                      />

                      <SmallDetail
                        label="Alternate Phone"
                        value={
                          contact.alternate_phone ??
                          "Not recorded"
                        }
                      />

                      <SmallDetail
                        label="Email"
                        value={
                          contact.email ??
                          "Not recorded"
                        }
                      />

                      <SmallDetail
                        label="Location"
                        value={
                          [contact.city, contact.country]
                            .filter(Boolean)
                            .join(", ") || "Not recorded"
                        }
                      />
                    </div>
                  </div>

                  {editable ? (
                    <form
                      action={deleteCandidateEmergencyContact.bind(
                        null,
                        id,
                        contact.id,
                      )}
                    >
                      <RemoveButton />
                    </form>
                  ) : null}
                </div>
              </article>
            ))}

            {!emergencyContacts.length ? (
              <EmptyState
                title="No emergency contact recorded"
                text="Add at least one trusted emergency contact before completing this section."
              />
            ) : null}
          </div>

          <Divider />

          <SectionHeading
            title="Add Emergency Contact"
            subtitle="Enter one trusted person's current contact details."
          />

          <form
            action={addCandidateEmergencyContact.bind(
              null,
              id,
            )}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Full Name"
                name="full_name"
                required
              />

              <Input
                label="Relationship"
                name="relationship"
                placeholder="Spouse, parent, sibling, friend..."
              />

              <Input
                label="Primary Phone"
                name="phone"
                type="tel"
                required
              />

              <Input
                label="Alternate Phone"
                name="alternate_phone"
                type="tel"
              />

              <Input
                label="Email"
                name="email"
                type="email"
              />

              <Input
                label="City / Town"
                name="city"
              />

              <Input
                label="Country"
                name="country"
              />
            </div>

            <SaveButton
              label="Add Emergency Contact"
              disabled={!editable}
            />
          </form>

          <Divider />

          <CompletionBox
            title="Finished with Emergency Contact?"

            text="Confirm that at least one trusted emergency contact is recorded and the details are current."
          >
            <form
              action={completeCandidateEmergencySection.bind(
                null,
                id,
              )}
            >
              <SaveButton
                label="Complete Emergency Contact & Continue to References"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}

      {/* REFERENCES */}
      {section === "references" ? (
        <SectionPanel
          title="Professional & Personal References"
          subtitle="Provide people who can confirm your work history, character, training or professional background where relevant."
        >
          <Notice
            title="Reference information"
            text="Only provide genuine references. If you allow Red Stone Employment Agency to contact a reference, make sure the person has agreed to be contacted and that the contact details are current."
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <MiniStat
              label="References Recorded"
              value={String(references.length)}
            />

            <MiniStat
              label="Contact Permission"
              value={String(
                references.filter(
                  (reference) => reference.can_contact,
                ).length,
              )}
            />

            <MiniStat
              label="With Organisation"
              value={String(
                references.filter(
                  (reference) => Boolean(reference.organisation),
                ).length,
              )}
            />
          </div>

          <SectionHeading
            title="Recorded References"
            subtitle={`${references.length} reference record${
              references.length === 1 ? "" : "s"
            }`}
          />

          <div className="space-y-4">
            {references.map((reference) => (
              <article
                key={reference.id}
                className="rounded-2xl border border-slate-200 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-black text-[#071A3D]">
                        {reference.full_name}
                      </p>

                      {reference.relationship ? (
                        <InfoBadge text={reference.relationship} />
                      ) : null}

                      {reference.can_contact ? (
                        <SuccessBadge text="Contact Permitted" />
                      ) : (
                        <NeutralBadge text="Do Not Contact" />
                      )}
                    </div>

                    {(reference.job_title ||
                      reference.organisation) ? (
                      <p className="mt-2 text-sm font-semibold text-slate-700">
                        {[reference.job_title, reference.organisation]
                          .filter(Boolean)
                          .join(" — ")}
                      </p>
                    ) : null}

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      <SmallDetail
                        label="Phone"
                        value={
                          reference.phone ??
                          "Not recorded"
                        }
                      />

                      <SmallDetail
                        label="Email"
                        value={
                          reference.email ??
                          "Not recorded"
                        }
                      />

                      <SmallDetail
                        label="Country"
                        value={
                          reference.country ??
                          "Not recorded"
                        }
                      />

                      <SmallDetail
                        label="May Be Contacted"
                        value={
                          reference.can_contact
                            ? "Yes"
                            : "No"
                        }
                      />
                    </div>
                  </div>

                  {editable ? (
                    <form
                      action={deleteCandidateReference.bind(
                        null,
                        id,
                        reference.id,
                      )}
                    >
                      <RemoveButton />
                    </form>
                  ) : null}
                </div>
              </article>
            ))}

            {!references.length ? (
              <EmptyState
                title="No references recorded"
                text="Add a professional or personal reference below, or declare that you have no references to provide at this stage."
              />
            ) : null}
          </div>

          <Divider />

          <SectionHeading
            title="Add Reference"
            subtitle="Add one reference person at a time."
          />

          <form
            action={addCandidateReference.bind(
              null,
              id,
            )}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Full Name"
                name="full_name"
                required
              />

              <Input
                label="Relationship"
                name="relationship"
                placeholder="Supervisor, manager, lecturer, colleague, family friend..."
              />

              <Input
                label="Organisation"
                name="organisation"
                placeholder="Employer, company, school or institution"
              />

              <Input
                label="Job Title / Position"
                name="job_title"
              />

              <Input
                label="Phone"
                name="phone"
                type="tel"
              />

              <Input
                label="Email"
                name="email"
                type="email"
              />

              <Input
                label="Country"
                name="country"
              />
            </div>

            <CheckboxCard
              name="can_contact"
              title="I permit this reference to be contacted"
              text="Select this only if the reference has agreed that authorised staff may contact them where necessary."
            />

            <SaveButton
              label="Add Reference"
              disabled={!editable}
            />
          </form>

          <Divider />

          <CompletionBox
            title="Finished with References?"
            text="Review the reference details and contact permissions before continuing."
          >
            <form
              action={completeCandidateReferencesSection.bind(
                null,
                id,
              )}
              className="space-y-4"
            >
              {references.length === 0 ? (
                <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                  <input
                    type="checkbox"
                    name="no_references"
                    value="yes"
                    className="mt-1 h-4 w-4"
                  />

                  <span>
                    <span className="block text-sm font-bold text-[#071A3D]">
                      I have no references to provide at this stage
                    </span>

                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      Select this only if you genuinely have no reference information to declare for this case.
                    </span>
                  </span>
                </label>
              ) : null}

              <SaveButton
                label="Complete References & Continue to Finances"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}

      {/* FINANCES */}
      {section === "finances" ? (
        <SectionPanel
          title="Financial Information & Sponsorship"
          subtitle="Record the funding information relevant to your recruitment and immigration case."
        >
          <Notice
            title="Financial information"
            text="Provide accurate information only. Do not enter bank account numbers, card numbers, PINs or passwords here. Financial evidence may be requested separately where it is lawfully required for your case."
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MiniStat
              label="Funding Source"
              value={finances?.funding_source ?? "Not set"}
            />
            <MiniStat
              label="Available Funds"
              value={
                finances?.available_funds != null
                  ? `${finances.currency ?? "KES"} ${Number(
                      finances.available_funds,
                    ).toLocaleString()}`
                  : "Not set"
              }
            />
            <MiniStat
              label="Monthly Income"
              value={
                finances?.monthly_income != null
                  ? `${finances.currency ?? "KES"} ${Number(
                      finances.monthly_income,
                    ).toLocaleString()}`
                  : "Not set"
              }
            />
            <MiniStat
              label="Employer Sponsorship"
              value={
                finances?.employer_sponsorship_expected
                  ? "Expected"
                  : "Not confirmed"
              }
            />
          </div>

          <Divider />

          <SectionHeading
            title="Funding Details"
            subtitle="Enter the financial information currently applicable to this case."
          />

          <form
            action={saveCandidateFinancialInformation.bind(null, id)}
            className="space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Primary Funding Source"
                name="funding_source"
                placeholder="Personal savings, salary, family sponsor, employer sponsorship..."
                defaultValue={finances?.funding_source ?? ""}
                required
              />

              <Input
                label="Currency"
                name="currency"
                placeholder="KES"
                defaultValue={finances?.currency ?? "KES"}
              />

              <Input
                label="Available Funds"
                name="available_funds"
                type="number"
                min="0"
                step="0.01"
                defaultValue={String(finances?.available_funds ?? "")}
              />

              <Input
                label="Monthly Income"
                name="monthly_income"
                type="number"
                min="0"
                step="0.01"
                defaultValue={String(finances?.monthly_income ?? "")}
              />

              <Input
                label="Sponsor Name"
                name="sponsor_name"
                placeholder="If another person is supporting you"
                defaultValue={finances?.sponsor_name ?? ""}
              />

              <Input
                label="Sponsor Relationship"
                name="sponsor_relationship"
                placeholder="Parent, spouse, relative, employer..."
                defaultValue={finances?.sponsor_relationship ?? ""}
              />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-black text-[#071A3D]">
                Supporting Financial Information
              </p>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <input
                  type="checkbox"
                  name="proof_of_funds_available"
                  defaultChecked={Boolean(finances?.proof_of_funds_available)}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  <span className="block text-sm font-bold text-[#071A3D]">
                    Proof of funds is available
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    Select this only if you currently have supporting financial
                    evidence that can be provided when legitimately requested.
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <input
                  type="checkbox"
                  name="employer_sponsorship_expected"
                  defaultChecked={Boolean(
                    finances?.employer_sponsorship_expected,
                  )}
                  className="mt-1 h-4 w-4"
                />
                <span>
                  <span className="block text-sm font-bold text-[#071A3D]">
                    Employer sponsorship is expected
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    This records an expectation only. It does not confirm or
                    guarantee employer payment or government approval.
                  </span>
                </span>
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-black text-[#071A3D]">
                Expected Employer Coverage
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Select only items you have been informed the employer is
                expected to cover.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  [
                    "employer_covers_visa",
                    "Visa / permit costs",
                    finances?.employer_covers_visa,
                  ],
                  [
                    "employer_covers_flight",
                    "Flight costs",
                    finances?.employer_covers_flight,
                  ],
                  [
                    "employer_covers_accommodation",
                    "Accommodation",
                    finances?.employer_covers_accommodation,
                  ],
                  [
                    "employer_covers_medical",
                    "Medical costs",
                    finances?.employer_covers_medical,
                  ],
                ].map(([name, label, checked]) => (
                  <label
                    key={String(name)}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <input
                      type="checkbox"
                      name={String(name)}
                      defaultChecked={Boolean(checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm font-semibold text-slate-700">
                      {String(label)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="financial_notes"
                className="mb-2 block text-sm font-bold text-[#071A3D]"
              >
                Financial Notes
              </label>
              <textarea
                id="financial_notes"
                name="financial_notes"
                rows={5}
                defaultValue={finances?.financial_notes ?? ""}
                placeholder="Add any relevant explanation about funding or sponsorship. Do not enter banking credentials or confidential account details."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20"
              />
            </div>

            <SaveButton
              label="Save Financial Information"
              disabled={!editable}
            />
          </form>

          <Divider />

          <CompletionBox
            title="Finished with Financial Information?"
            text="Review your funding and sponsorship information carefully before continuing to the declarations section."
          >
            <form
              action={completeCandidateFinancesSection.bind(null, id)}
            >
              <SaveButton
                label="Complete Finances & Continue to Declarations"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}

      {/* DECLARATIONS */}
      {section === "declarations" ? (
        <SectionPanel
          title="Immigration & Compliance Declarations"
          subtitle="Answer all declarations truthfully and review them carefully before continuing."
        >
          <Notice
            title="Important declaration"
            text="These answers form part of your recruitment and immigration case record. Visa and work-permit decisions are made by the relevant government authorities."
          />

          <form action={saveCandidateImmigrationDeclarations.bind(null, id)} className="space-y-5">
            <SectionHeading
              title="Immigration History"
              subtitle="Select each statement that applies and provide the relevant details."
            />

            <DeclarationItem
              name="previous_visa_refusal"
              title="I have previously had a visa application refused"
              checked={Boolean(declarations?.previous_visa_refusal)}
              detailsName="previous_visa_refusal_details"
              detailsValue={declarations?.previous_visa_refusal_details ?? ""}
              detailsPlaceholder="Country, visa type, approximate date and outcome..."
              disabled={!editable}
            />

            <DeclarationItem
              name="previous_overstay"
              title="I (have previously overstayed a visa or immigration permission"
              checked={Boolean(declarations?.previous_overstay)}
              detailsName="previous_overstay_details"
              detailsValue={declarations?.previous_overstay_details ?? ""}
              detailsPlaceholder="Country, dates and circumstances..."
              disabled={!editable}
            />

            <DeclarationItem
              name="previous_deportation_or_removal"
              title="I have previously been deported, removed or ordered to leave a country"
              checked={Boolean(declarations?.previous_deportation_or_removal)}
              detailsName="previous_deportation_details"
              detailsValue={declarations?.previous_deportation_details ?? ""}
              detailsPlaceholder="Country, approximate date and circumstances..."
              disabled={!editable}
            />

            <DeclarationItem
              name="immigration_violation"
              title="I have previously breached immigration rules or conditions"
              checked={Boolean(declarations?.immigration_violation)}
              detailsName="immigration_violation_details"
              detailsValue={declarations?.immigration_violation_details ?? ""}
              detailsPlaceholder="Describe the immigration issue accurately..."
              disabled={!editable}
            />

            <DeclarationItem
              name="criminal_charge_or_conviction"
              title="I have been charged with or convicted of a criminal offence"
              checked={Boolean(declarations?.criminal_charge_or_conviction)}
              detailsName="criminal_details"
              detailsValue={declarations?.criminal_details ?? ""}
              detailsPlaceholder="Provide the relevant offence, country, approximate date and outcome..."
              disabled={!editable}
            />

            <DeclarationItem
              name="military_service"
              title="I have served in the military or armed forces"
              checked={Boolean(declarations?.military_service)}
              detailsName="military_service_details"
              detailsValue={declarations?.military_service_details ?? ""}
              detailsPlaceholder="Country, branch, role and service period..."
              disabled={!editable}
            />

            <DeclarationItem
              name="government_service"
              title="I have held government or public service employment"
              checked={Boolean(declarations?.government_service)}
              detailsName="government_service_details"
              detailsValue={declarations?.government_service_details ?? ""}
              detailsPlaceholder="Country, department, role and service period..."
              disabled={!editable}
            />

            <DeclarationItem
              name="medical_disclosure_required"
              title="There is medical information I have been specifically required to disclose for this process"
              checked={Boolean(declarations?.medical_disclosure_required)}
              detailsName="medical_disclosure_details"
              detailsValue={declarations?.medical_disclosure_details ?? ""}
              detailsPlaceholder="Provide only the minimum medical information specifically required..."
              disabled={!editable}
            />

            <Divider />

            <SectionHeading
              title="Consent & Certification"
              subtitle="Review each statement carefully before continuing."
            />

            <CheckboxCard
              name="consent_to_data_processing"
              title="I consent to processing of my application information"
              text="I authorise information necessary for this recruitment and immigration process to be stored and processed for legitimate case-management purposes."
              defaultChecked={Boolean(declarations?.consent_to_data_processing)}
              disabled={!editable}
            />

            <CheckboxCard
              name="consent_to_employer_sharing"
              title="I consent to relevant information being shared with a prospective employer"
              text="Only information reasonably required for recruitment, assessment, placement or employment processing should be shared."
              defaultChecked={Boolean(declarations?.consent_to_employer_sharing)}
              disabled={!editable}
            />

            <CheckboxCard
              name="consent_to_authority_sharing"
              title="I consent to relevant information being shared with authorised authorities where required"
              text="This may include immigration, visa, labour or other lawful authorities where disclosure is necessary for the application process."
              defaultChecked={Boolean(declarations?.consent_to_authority_sharing)}
              disabled={!editable}
            />

            <CheckboxCard
              name="certify_true_and_complete"
              title="I certify that the information I have provided is true and complete"
              text="I understand that false, misleading or deliberately omitted information may affect my recruitment or immigration case."
              defaultChecked={Boolean(declarations?.certify_true_and_complete)}
              disabled={!editable}
            />

            <Input
              label="Declaration Signed Name"
              name="declaration_signed_name"
              defaultValue={declarations?.declaration_signed_name ?? ""}
              placeholder="Enter your full legal name"
              required
            />

            {declarations?.declaration_signed_at ? (
              <p className="text-xs text-slate-500">
                Last signed:{" "}
                {new Date(declarations.declaration_signed_at).toLocaleString()}
              </p>
            ) : null}

            {/* DECLARATIONS_QUESTIONS */}

            <SaveButton label="Save Declarations" disabled={!editable} />
          </form>

          <CompletionBox
            title="Finished with Declarations?"
            text="Save and review your declarations before continuing to documents."
          >
            <form action={completeCandidateDeclarationsSection.bind(null, id)}>
              <SaveButton
                label="Complete Declarations & Continue to Documents"
                disabled={!editable}
              />
            </form>
          </CompletionBox>
        </SectionPanel>
      ) : null}
      {/* DOCUMENTS */}
      {section === "documents" ? (
        <SectionPanel
          title="Supporting Documents"
          subtitle="Upload supporting evidence for your employment and immigration case."
        >
          <Warning
            title="Only upload genuine documents"
            text="Required documents vary according to the destination, employer and immigration program."
          />

          <form
            action={uploadCandidateDocument.bind(
              null,
              id,
            )}
            className="grid gap-3 rounded-2xl bg-slate-50 p-4 lg:grid-cols-[240px_1fr_auto]"
          >
            <select
              name="document_type"
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-3"
            >
              {DOCUMENT_TYPES.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {titleCase(type)}
                  </option>
                ),
              )}
            </select>

            <input
              name="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
              required
              className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-2"
            />

            <button
              type="submit"
              disabled={!editable}
              className="rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white disabled:bg-slate-400"
            >
              Upload Document
            </button>
          </form>

          <div className="space-y-3">
            {documents.map(
              (document) => (
                <article
                  key={String(
                    document.id,
                  )}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-bold text-[#071A3D]">
                      {String(
                        document.file_name ??
                          document.document_type ??
                          "Document",
                      )}
                    </p>

                    <p className="mt-1 text-sm text-slate-600">
                      {candidateDocumentStatus(
                        String(
                          document.verification_status ??
                            "pending",
                        ),
                      )}
                    </p>

                    {document.verification_status ===
                      "rejected" &&
                    document.verification_note ? (
                      <p className="mt-2 text-sm text-red-700">
                        {String(
                          document.verification_note,
                        )}
                      </p>
                    ) : null}
                  </div>

                  <Link
                    href={`/candidate/documents/${String(
                      document.id,
                    )}/view`}
                    className="font-bold text-[#B8860B]"
                  >
                    View Document
                  </Link>
                </article>
              ),
            )}

            {!documents.length ? (
              <EmptyState
                title="No documents uploaded"
                text="Uploaded documents will appear here."
              />
            ) : null}
          </div>
        </SectionPanel>
      ) : null}

      {/* REVIEW */}
      {section === "review" ? (
        <SectionPanel
          title="Final Application Review"
          subtitle="Review the status of each application section before you consider your case information complete."
        >
          <Notice
            title="Review before proceeding"
            text="Check every section carefully. A completed portal review does not mean that a visa, work permit or employment placement has been approved."
          />

          <div className="grid gap-3 md:grid-cols-2">
            {SECTIONS.filter((item) => item.key !== "review").map((item) => {
              const progress = (progressRows ?? []).find(
                (row) => row.section_key === item.key,
              );
              const status = progress?.status ?? "incomplete";
              const complete = status === "complete";

              return (
                <article
                  key={item.key}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#071A3D]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {complete
                          ? "Section marked complete"
                          : status === "in_progress"
                            ? "Section still in progress"
                            : "Section not yet marked complete"}
                      </p>
                    </div>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                      {status.replaceAll("_", " ")}
                    </span>
                  </div>

                  <Link
                    href={`/candidate/applications/${id}?section=${item.key}`}
                    className="mt-4 inline-flex text-sm font-bold text-[#B8860B]"
                  >
                    Review {item.label}
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 p-5">
            <p className="text-sm font-bold text-[#071A3D]">
              Final verification
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Confirm that your personal, immigration, employment, financial,
              declaration and document information is accurate and current before
              relying on this application record for recruitment processing.
            </p>
          </div>
        </SectionPanel>
      ) : null}

      {/* UPCOMING */}
      {![
        "personal",
        "passport",
        "addresses",
        "family",
        "education",
        "employment",
        "languages",
        "licenses",
        "travel",
        "visas",
        "emergency",
        "references",
        "finances",
        "declarations",
        "documents",
      ].includes(section) ? (
        <SectionPanel
          title={
            SECTIONS.find(
              (item) =>
                item.key === section,
            )?.label ??
            "Immigration Section"
          }
          subtitle="This section is part of your advanced immigration intake."
        >
          <EmptyState
            title="Section ready for the next build stage"
            text="The secure database structure is already installed. The working Save & Continue form will be connected next."
          />
        </SectionPanel>
      ) : null}

      {/* ORIGINAL APPLICATION */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionPanel
          title="Original Job Application"
          subtitle="Information originally submitted for this employment opportunity."
        >
          <Detail
            label="Submitted"
            value={dateText(
              application.submitted_at ??
                application.created_at,
            )}
          />

          <Detail
            label="Last Updated"
            value={dateText(
              application.updated_at,
            )}
          />

          <Detail
            label="Application Stage"
            value={candidateStatusLabel(
              status,
            )}
          />

          <Detail
            label="Relevant Experience"
            value={String(
              application.relevant_experience ??
                "Not provided",
            )}
          />

          <Detail
            label="Availability"
            value={String(
              application.availability ??
                "Not provided",
            )}
          />

          <Detail
            label="Cover Letter"
            value={String(
              application.cover_letter ??
                "No cover letter saved.",
            )}
          />
        </SectionPanel>

        <SectionPanel
          title="Recruitment Timeline"
          subtitle="Recorded status changes for your application."
        >
          {timeline.length ? (
            <ol className="space-y-4">
              {timeline.map((event) => (
                <li
                  key={String(event.id)}
                  className="border-l-2 border-[#D4AF37] pl-4"
                >
                  <p className="font-bold text-[#071A3D]">
                    {candidateStatusLabel(
                      String(
                        event.new_status ??
                          "",
                      ),
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {dateText(
                      event.created_at,
                    )}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              title="No timeline activity"
              text="Status updates will appear here."
            />
          )}
        </SectionPanel>
      </div>

      {!editable ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-bold text-amber-900">
            This case is read-only.
          </p>

          <p className="mt-1 text-sm text-amber-800">
            Immigration information cannot
            currently be changed because of the
            application&apos;s status.
          </p>
        </section>
      ) : null}

      {WITHDRAWABLE_STATUSES.includes(
        status,
      ) ? (
        <form
          action={withdrawApplication.bind(
            null,
            id,
          )}
          className="rounded-2xl border border-red-200 bg-red-50 p-5"
        >
          <p className="font-bold text-red-900">
            Withdraw Application
          </p>

          <p className="mt-1 text-sm text-red-700">
            Withdrawing may stop further
            processing of this case.
          </p>

          <input
            type="hidden"
            name="confirm"
            value="yes"
          />

          <button
            type="submit"
            className="mt-4 rounded-xl bg-red-700 px-5 py-3 text-sm font-black text-white"
          >
            Withdraw Application
          </button>
        </form>
      ) : null}

      <section className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5">
        <p className="font-bold text-[#071A3D]">
          Accuracy & Immigration Declaration
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          Information should be truthful,
          accurate and supported by genuine
          documentation. Recruitment and
          application assistance does not
          guarantee employment, a visa, permit or
          immigration approval. Final decisions
          remain with the relevant employer and
          government authority.
        </p>
      </section>
    </div>
  );
}

/* =========================================================
   UI COMPONENTS
   ========================================================= */

function SectionPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:px-6">
        <h2 className="text-xl font-black text-[#071A3D]">
          {title}
        </h2>

        {subtitle ? (
          <p className="mt-1 text-sm leading-6 text-slate-500">
            {subtitle}
          </p>
        ) : null}
      </header>

      <div className="space-y-6 p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function DeclarationItem({ name, title, checked, detailsName, detailsValue, detailsPlaceholder, disabled = false, }: { name: string; title: string; checked: boolean; detailsName: string; detailsValue: string; detailsPlaceholder?: string; disabled?: boolean; }) { return ( <div className="rounded-2xl border border-slate-200 bg-white p-5"> <label className="flex items-start gap-3"> <input type="checkbox" name={name} defaultChecked={checked} disabled={disabled} className="mt-1 h-4 w-4" /> <span className="text-sm font-bold text-[#071A3D]">{title}</span> </label> <textarea name={detailsName} defaultValue={detailsValue} placeholder={detailsPlaceholder} disabled={disabled} rows={3} className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 disabled:bg-slate-100" /> </div> ); }

function Input({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required = false,
  min,
  step,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  min?: string;
  step?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>
        {label}

        {required ? (
          <span className="ml-1 text-red-600">
            *
          </span>
        ) : null}
      </span>

      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={min}
        step={step}
        className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-sm font-normal outline-none transition focus:border-[#071A3D] focus:ring-2 focus:ring-[#071A3D]/10"
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  placeholder,
  rows = 4,
}: {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      {label}

      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-normal outline-none transition focus:border-[#071A3D] focus:ring-2 focus:ring-[#071A3D]/10"
      />
    </label>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>
        {label}

        {required ? (
          <span className="ml-1 text-red-600">
            *
          </span>
        ) : null}
      </span>

      <select
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="min-h-12 rounded-xl border border-slate-300 bg-white px-3"
      >
        <option value="">
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxCard({
  name,
  title,
  text,
  defaultChecked = false,
  disabled = false,
}: {
  name: string;
  title: string;
  text: string;
  defaultChecked?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        disabled={disabled}
        className="mt-1 h-4 w-4"
      />

      <span>
        <span className="block text-sm font-bold text-[#071A3D]">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {text}
        </span>
      </span>
    </label>
  );
}

function SaveButton({
  label,
  disabled,
}: {
  label: string;
  disabled: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="rounded-xl bg-[#071A3D] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#0B2859] disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {label}
    </button>
  );
}

function RemoveButton() {
  return (
    <button
      type="submit"
      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-100"
    >
      Remove
    </button>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-100 pb-3 last:border-b-0">
      <p className="text-xs font-black uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-6 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function SmallDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function LanguageSkill({
  label,
  level,
}: {
  label: string;
  level: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>

      <p className="mt-1 font-black text-[#071A3D]">
        {level}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-black text-[#071A3D]">
        {value}
      </p>
    </div>
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-black text-[#071A3D]">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
      <p className="font-black text-[#071A3D]">
        {title}
      </p>

      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}

function Notice({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
      <p className="text-sm font-bold text-blue-900">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-blue-800">
        {text}
      </p>
    </div>
  );
}

function Warning({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="text-sm font-bold text-amber-900">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-amber-800">
        {text}
      </p>
    </div>
  );
}

function CompletionBox({
  title,
  text,
  children,
}: {
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-5">
      <h3 className="font-black text-[#071A3D]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {text}
      </p>

      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}

function SuccessBadge({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
      {text}
    </span>
  );
}

function PendingBadge({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
      {text}
    </span>
  );
}

function InfoBadge({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
      {text}
    </span>
  );
}

function ExpiredBadge({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
      {text}
    </span>
  );
}

function NeutralBadge({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
      {text}
    </span>
  );
}

function Divider() {
  return (
    <div className="border-t border-slate-200" />
  );
}