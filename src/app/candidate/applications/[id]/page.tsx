import Link from "next/link";
import { notFound } from "next/navigation";

import PaymentStatusRefresher from "./PaymentStatusRefresher";
import { DocumentUploadRows } from "@/components/candidate/DocumentUploadRows";
import {
  completeCandidateDocumentsSection,
  initiateApplicationPayment,
  prepareApplicationPayment,
  uploadCandidateDocument,
  withdrawApplication,
} from "@/lib/candidate/actions";
import { requireCandidate } from "@/lib/candidate/auth";
import {
  candidateDocumentStatus,
  candidateStatusLabel,
  WITHDRAWABLE_STATUSES,
} from "@/lib/candidate/constants";
import { getCandidateApplication } from "@/lib/candidate/data";
import {
  saveSimpleDeclaration,
  saveSimplePassportInformation,
  saveSimplePersonalInformation,
} from "@/lib/candidate/simple-application-actions";
import {
  CV_DOCUMENT_VERIFICATION_FEE,
  paymentConfigurationState,
} from "@/lib/payments/config";
import { createClient } from "@/utils/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type SimpleProfile = {
  given_names?: string | null;
  family_name?: string | null;
  sex?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  primary_phone?: string | null;
  primary_email?: string | null;
  residence_country?: string | null;
  passport_number?: string | null;
  passport_issue_country?: string | null;
  passport_issue_date?: string | null;
  passport_expiry_date?: string | null;
};

type SimpleDeclaration = {
  consent_to_data_processing?: boolean | null;
  consent_to_employer_sharing?: boolean | null;
  consent_to_authority_sharing?: boolean | null;
  certify_true_and_complete?: boolean | null;
  declaration_signed_name?: string | null;
  declaration_signed_at?: string | null;
};

type ProgressRow = {
  section_key: string;
  status: string;
};

const STEPS = [
  { key: "personal", label: "Personal" },
  { key: "passport", label: "Passport" },
  { key: "declarations", label: "Declaration" },
  { key: "documents", label: "Documents" },
  { key: "review", label: "Review" },
  { key: "payment", label: "Payment" },
] as const;

const REQUIRED_SECTIONS = ["personal", "passport", "declarations", "documents"] as const;

const SIMPLE_DOCUMENT_TYPES = [
  "cv",
  "passport",
  "national_id",
  "good_conduct",
  "certificate",
  "other",
];

function text(value: unknown) {
  return value == null || value === "" ? "Not provided" : String(value);
}

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function dateText(value: unknown) {
  if (!value) return "Not provided";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium" }).format(date);
}

function caseReference(id: string) {
  return `APP-${id.slice(0, 8).toUpperCase()}`;
}

export default async function CandidateApplicationDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = (await searchParams) ?? {};
  const requestedSection = typeof query.section === "string" ? query.section : "personal";
  const section = STEPS.some((step) => step.key === requestedSection)
    ? requestedSection
    : "personal";

  const context = await requireCandidate(`/candidate/applications/${id}`);
  const needsDocuments = section === "documents" || section === "review";
  const needsPayments = section === "payment";

  const { application, documents, payments } = await getCandidateApplication(context, id, {
    includeDocuments: needsDocuments,
    includePayments: needsPayments,
    includeTimeline: false,
  });

  if (!application) notFound();

  const supabase = await createClient();
  const [profileResult, declarationResult, progressResult] = await Promise.all([
    supabase
      .from("application_immigration_profiles")
      .select(
        "given_names, family_name, sex, date_of_birth, nationality, primary_phone, primary_email, residence_country, passport_number, passport_issue_country, passport_issue_date, passport_expiry_date",
      )
      .eq("application_id", id)
      .maybeSingle<SimpleProfile>(),
    supabase
      .from("application_immigration_declarations")
      .select(
        "consent_to_data_processing, consent_to_employer_sharing, consent_to_authority_sharing, certify_true_and_complete, declaration_signed_name, declaration_signed_at",
      )
      .eq("application_id", id)
      .maybeSingle<SimpleDeclaration>(),
    supabase
      .from("application_section_progress")
      .select("section_key, status")
      .eq("application_id", id)
      .returns<ProgressRow[]>(),
  ]);

  const profile = profileResult.data ?? {};
  const declaration = declarationResult.data ?? {};
  const progressRows = progressResult.data ?? [];
  const progress = new Map(progressRows.map((row) => [row.section_key, row.status]));
  const completedRequired = REQUIRED_SECTIONS.filter(
    (key) => progress.get(key) === "complete",
  ).length;
  const completion = Math.round((completedRequired / REQUIRED_SECTIONS.length) * 100);
  const readyForReview = completedRequired === REQUIRED_SECTIONS.length;

  const job = application.job as Record<string, unknown> | null;
  const status = String(application.status ?? "draft").toLowerCase();
  const editable = status === "draft";

  const paymentRows = payments ?? [];
  const activePayment = paymentRows.find((payment) =>
    ["initiated", "pending"].includes(String(payment.status ?? "")),
  );
  const paidPayment = paymentRows.find(
    (payment) => String(payment.status ?? "") === "paid",
  );
  const latestPayment = paymentRows[0] ?? null;
  const paymentState = paymentConfigurationState();
  const paymentAllowed =
    ["ready_for_payment", "payment_pending", "submitted"].includes(status) ||
    Boolean(paidPayment);

  const saved = typeof query.saved === "string" ? query.saved : "";
  const error = typeof query.error === "string" ? query.error : "";
  const legacyPaymentError =
    typeof query.payment_error === "string" ? query.payment_error : "";

  const fullName = String(context.profile.full_name ?? "").trim();
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  const defaultGivenNames = profile.given_names ?? nameParts.slice(0, -1).join(" ") ?? "";
  const defaultFamilyName = profile.family_name ?? nameParts.at(-1) ?? "";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/candidate/applications"
        prefetch={false}
        className="inline-flex text-sm font-bold text-[#071A3D] hover:text-[#B8860B]"
      >
        ← My Applications
      </Link>

      <section className="overflow-hidden rounded-3xl bg-[#071A3D] shadow-xl">
        <div className="grid gap-6 px-6 py-7 sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#F2D675]">
              Job Application
            </p>
            <p className="mt-3 font-mono text-xs font-bold text-[#F2D675]">
              {caseReference(id)}
            </p>
            <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
              {text(job?.title ?? "Employment Application")}
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              {[job?.city, job?.country].filter(Boolean).join(", ") || "Location not specified"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Status</p>
            <p className="mt-2 font-black text-white">{candidateStatusLabel(status)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Application Progress
            </p>
            <p className="mt-2 text-3xl font-black text-[#071A3D]">{completion}%</p>
          </div>
          <p className="text-sm font-semibold text-slate-600">
            {completedRequired} of {REQUIRED_SECTIONS.length} required sections complete
          </p>
        </div>
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#D4AF37] transition-all"
            style={{ width: `${completion}%` }}
          />
        </div>
      </section>

      <nav className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm" aria-label="Application steps">
        <div className="flex gap-2 overflow-x-auto">
          {STEPS.map((step, index) => {
            const coreComplete = progress.get(step.key) === "complete";
            const reviewComplete =
              step.key === "review" && ["ready_for_payment", "payment_pending", "submitted"].includes(status);
            const paymentComplete = step.key === "payment" && (Boolean(paidPayment) || status === "submitted");
            const complete = coreComplete || reviewComplete || paymentComplete;
            const current = section === step.key;
            const target = step.key === "payment" && !paymentAllowed ? "review" : step.key;

            return (
              <Link
                key={step.key}
                href={`/candidate/applications/${id}?section=${target}`}
                prefetch={false}
                className={`whitespace-nowrap rounded-xl border px-4 py-2.5 text-sm font-bold transition ${
                  current
                    ? "border-[#071A3D] bg-[#071A3D] text-white"
                    : complete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#D4AF37]"
                }`}
              >
                {complete ? "✓ " : `${index + 1}. `}
                {step.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {saved ? (
        <Alert tone="success" title="Saved" text="Your information has been saved successfully." />
      ) : null}

      {error ? <Alert tone="error" title="Please check this section" text={error} /> : null}

      {legacyPaymentError && !error ? (
        <Alert
          tone="error"
          title="Payment could not continue"
          text="Return to Review, confirm the required sections are complete, then continue to payment again."
        />
      ) : null}

      {!editable && !["review", "payment"].includes(section) ? (
        <Alert
          tone="info"
          title="Application locked for editing"
          text="This application has already moved to review or payment processing. You can still review what you submitted."
        />
      ) : null}

      {section === "personal" ? (
        <Panel
          title="Personal & Contact Details"
          subtitle="Only the information needed to identify you and contact you about this application."
        >
          <form
            action={saveSimplePersonalInformation.bind(null, id)}
            className="grid gap-5 md:grid-cols-2"
          >
            <Field label="Given Names" name="given_names" defaultValue={defaultGivenNames} required disabled={!editable} />
            <Field label="Family / Surname" name="family_name" defaultValue={defaultFamilyName} required disabled={!editable} />
            <SelectField
              label="Sex"
              name="sex"
              defaultValue={profile.sex ?? ""}
              options={["Female", "Male", "Other"]}
              required
              disabled={!editable}
            />
            <Field
              label="Date of Birth"
              name="date_of_birth"
              type="date"
              defaultValue={profile.date_of_birth ?? context.profile.date_of_birth ?? ""}
              required
              disabled={!editable}
            />
            <Field
              label="Nationality"
              name="nationality"
              defaultValue={profile.nationality ?? context.profile.nationality ?? ""}
              required
              disabled={!editable}
            />
            <Field
              label="Country of Residence"
              name="residence_country"
              defaultValue={profile.residence_country ?? context.profile.country ?? ""}
              required
              disabled={!editable}
            />
            <Field
              label="Phone Number"
              name="primary_phone"
              type="tel"
              defaultValue={profile.primary_phone ?? context.profile.phone ?? ""}
              required
              disabled={!editable}
            />
            <Field
              label="Email Address"
              name="primary_email"
              type="email"
              defaultValue={profile.primary_email ?? context.user.email ?? ""}
              required
              disabled={!editable}
            />

            <div className="md:col-span-2">
              <PrimaryButton disabled={!editable}>Save & Continue to Passport</PrimaryButton>
            </div>
          </form>
        </Panel>
      ) : null}

      {section === "passport" ? (
        <Panel
          title="Passport Details"
          subtitle="Use the passport you intend to use for this employment application."
        >
          <form
            action={saveSimplePassportInformation.bind(null, id)}
            className="grid gap-5 md:grid-cols-2"
          >
            <Field
              label="Passport Number"
              name="passport_number"
              defaultValue={profile.passport_number ?? ""}
              required
              disabled={!editable}
            />
            <Field
              label="Issuing Country"
              name="passport_issue_country"
              defaultValue={profile.passport_issue_country ?? ""}
              required
              disabled={!editable}
            />
            <Field
              label="Issue Date"
              name="passport_issue_date"
              type="date"
              defaultValue={profile.passport_issue_date ?? ""}
              required
              disabled={!editable}
            />
            <Field
              label="Expiry Date"
              name="passport_expiry_date"
              type="date"
              defaultValue={profile.passport_expiry_date ?? ""}
              required
              disabled={!editable}
            />

            <div className="md:col-span-2">
              <PrimaryButton disabled={!editable}>Save & Continue to Declaration</PrimaryButton>
            </div>
          </form>
        </Panel>
      ) : null}

      {section === "declarations" ? (
        <Panel
          title="Application Declaration"
          subtitle="A short declaration for this job application. Detailed immigration checks can be requested later if relevant."
        >
          <form action={saveSimpleDeclaration.bind(null, id)} className="space-y-4">
            <CheckField
              name="consent_to_data_processing"
              title="I consent to Red Stone processing my information for this application."
              defaultChecked={Boolean(declaration.consent_to_data_processing)}
              required
              disabled={!editable}
            />
            <CheckField
              name="consent_to_employer_sharing"
              title="I consent to relevant application information being shared with the recruiting employer or authorised recruitment partner."
              defaultChecked={Boolean(declaration.consent_to_employer_sharing)}
              required
              disabled={!editable}
            />
            <CheckField
              name="consent_to_authority_sharing"
              title="I consent to relevant information being shared with immigration or labour authorities later where legally required."
              defaultChecked={Boolean(declaration.consent_to_authority_sharing)}
              disabled={!editable}
            />
            <CheckField
              name="certify_true_and_complete"
              title="I certify that the information I have provided is true and complete."
              defaultChecked={Boolean(declaration.certify_true_and_complete)}
              required
              disabled={!editable}
            />

            <Field
              label="Full Legal Name / Signature"
              name="declaration_signed_name"
              defaultValue={declaration.declaration_signed_name ?? fullName}
              required
              disabled={!editable}
            />

            <PrimaryButton disabled={!editable}>Confirm & Continue to Documents</PrimaryButton>
          </form>
        </Panel>
      ) : null}

      {section === "documents" ? (
        <Panel
          title="Supporting Documents"
          subtitle="Upload the documents relevant to this job. You can add more later if the recruitment team requests them."
        >
          <DocumentUploadRows
            action={uploadCandidateDocument.bind(null, id)}
            documentTypes={SIMPLE_DOCUMENT_TYPES}
            disabled={!editable}
          />

          <div className="space-y-3">
            {documents.map((document) => (
              <article
                key={String(document.id)}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-[#071A3D]">
                    {text(document.file_name ?? titleCase(String(document.document_type ?? "Document")))}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {titleCase(String(document.document_type ?? "document"))} · {candidateDocumentStatus(String(document.verification_status ?? "pending"))}
                  </p>
                </div>
                <Link
                  href={`/candidate/documents/${String(document.id)}/view`}
                  prefetch={false}
                  className="text-sm font-bold text-[#B8860B]"
                >
                  View
                </Link>
              </article>
            ))}

            {!documents.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                No documents uploaded yet. A CV or passport is a good place to start.
              </div>
            ) : null}
          </div>

          <form action={completeCandidateDocumentsSection.bind(null, id)}>
            <PrimaryButton disabled={!editable || documents.length === 0}>
              Finish Documents & Continue to Review
            </PrimaryButton>
          </form>
        </Panel>
      ) : null}

      {section === "review" ? (
        <Panel
          title="Final Review"
          subtitle="Check the essential information before moving to the verification fee."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {REQUIRED_SECTIONS.map((key) => {
              const complete = progress.get(key) === "complete";
              return (
                <Link
                  key={key}
                  href={`/candidate/applications/${id}?section=${key}`}
                  prefetch={false}
                  className={`rounded-2xl border p-4 ${
                    complete
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-amber-200 bg-amber-50"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {titleCase(key)}
                  </p>
                  <p className={`mt-2 font-black ${complete ? "text-emerald-700" : "text-amber-800"}`}>
                    {complete ? "✓ Complete" : "Needs attention"}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <SummaryCard title="Candidate">
              <SummaryRow label="Name" value={`${text(profile.given_names)} ${text(profile.family_name)}`} />
              <SummaryRow label="Phone" value={text(profile.primary_phone)} />
              <SummaryRow label="Email" value={text(profile.primary_email)} />
              <SummaryRow label="Nationality" value={text(profile.nationality)} />
              <SummaryRow label="Residence" value={text(profile.residence_country)} />
            </SummaryCard>

            <SummaryCard title="Passport">
              <SummaryRow label="Number" value={text(profile.passport_number)} />
              <SummaryRow label="Issued by" value={text(profile.passport_issue_country)} />
              <SummaryRow label="Issue date" value={dateText(profile.passport_issue_date)} />
              <SummaryRow label="Expiry date" value={dateText(profile.passport_expiry_date)} />
            </SummaryCard>

            <SummaryCard title="Job Application">
              <SummaryRow label="Position" value={text(job?.title)} />
              <SummaryRow label="Experience" value={text(application.relevant_experience)} />
              <SummaryRow label="Availability" value={text(application.availability)} />
            </SummaryCard>

            <SummaryCard title="Documents">
              <SummaryRow label="Uploaded" value={`${documents.length} document${documents.length === 1 ? "" : "s"}`} />
              <SummaryRow label="Verification fee" value={`${CV_DOCUMENT_VERIFICATION_FEE.currency} ${CV_DOCUMENT_VERIFICATION_FEE.amount.toLocaleString("en-KE")}`} />
              <SummaryRow label="Declaration signed" value={declaration.declaration_signed_name ? "Yes" : "No"} />
            </SummaryCard>
          </div>

          {!readyForReview ? (
            <Alert
              tone="info"
              title="Complete the highlighted sections first"
              text="Payment is only available after Personal, Passport, Declaration and Documents are complete."
            />
          ) : null}

          <form action={prepareApplicationPayment.bind(null, id)}>
            <PrimaryButton disabled={!readyForReview || status !== "draft"}>
              Continue to Verification Fee
            </PrimaryButton>
          </form>
        </Panel>
      ) : null}

      {section === "payment" ? (
        <Panel
          title={CV_DOCUMENT_VERIFICATION_FEE.displayName}
          subtitle="Secure M-Pesa payment at the final submission stage."
        >
          {!paymentAllowed && !paidPayment ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-black text-amber-900">Finish Final Review first</p>
              <p className="mt-2 text-sm leading-6 text-amber-800">
                Payment has not been opened for this application yet. Complete the required sections and continue from Final Review.
              </p>
              <Link
                href={`/candidate/applications/${id}?section=review`}
                prefetch={false}
                className="mt-4 inline-flex rounded-xl bg-[#071A3D] px-5 py-3 text-sm font-black text-white"
              >
                Go to Final Review
              </Link>
            </div>
          ) : (
            <>
              <PaymentStatusRefresher active={Boolean(activePayment)} />

              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryBox label="Amount" value={`${CV_DOCUMENT_VERIFICATION_FEE.currency} ${CV_DOCUMENT_VERIFICATION_FEE.amount.toLocaleString("en-KE")}`} />
                <SummaryBox label="Purpose" value="CV & document verification" />
                <SummaryBox label="Status" value={candidateStatusLabel(status)} />
              </div>

              <p className="rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {CV_DOCUMENT_VERIFICATION_FEE.description}
              </p>

              {paidPayment ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <p className="font-black text-emerald-800">Payment received and application submitted</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <SummaryRow label="Receipt" value={text(paidPayment.receipt_number ?? paidPayment.provider_receipt)} />
                    <SummaryRow label="Paid" value={dateText(paidPayment.paid_at)} />
                    <SummaryRow label="Reference" value={text(paidPayment.internal_reference)} />
                  </div>
                </div>
              ) : (
                <form
                  action={initiateApplicationPayment.bind(null, id)}
                  className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5"
                >
                  {activePayment ? (
                    <Alert
                      tone="info"
                      title="M-Pesa request pending"
                      text={`Reference ${text(activePayment.internal_reference)} is still being processed. Avoid repeated payment attempts.`}
                    />
                  ) : latestPayment ? (
                    <Alert
                      tone="info"
                      title="Previous payment attempt"
                      text={`Reference ${text(latestPayment.internal_reference)} is ${text(latestPayment.status)}. You can retry if the previous attempt failed or expired.`}
                    />
                  ) : null}

                  <Field
                    label="M-Pesa Phone Number"
                    name="mpesa_phone"
                    type="tel"
                    defaultValue={profile.primary_phone ?? context.profile.phone ?? ""}
                    placeholder="07XXXXXXXX"
                    required
                  />

                  <CheckField
                    name="fee_acknowledgement"
                    value="yes"
                    title="I understand this is a verification and application processing fee, not payment for a job, sponsorship or guaranteed visa approval."
                    required
                  />

                  {!paymentState.paymentsEnabled ? (
                    <Alert
                      tone="info"
                      title="Payment service is being configured"
                      text="No M-Pesa request will be sent until payment collection is enabled."
                    />
                  ) : null}

                  <button
                    type="submit"
                    disabled={!paymentState.paymentsEnabled}
                    className="rounded-xl bg-[#D4AF37] px-6 py-3 text-sm font-black text-[#071A3D] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600"
                  >
                    Pay & Submit
                  </button>
                </form>
              )}
            </>
          )}
        </Panel>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <p className="font-bold text-[#071A3D]">Simple application, detailed checks later</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          This application collects only the essential information needed to start recruitment. Additional employment, immigration, medical or compliance information can be requested later when it is relevant to the job or destination.
        </p>
      </section>

      {WITHDRAWABLE_STATUSES.includes(status) ? (
        <details className="rounded-2xl border border-slate-200 bg-white p-5">
          <summary className="cursor-pointer text-sm font-bold text-slate-600">Application options</summary>
          <form action={withdrawApplication.bind(null, id)} className="mt-4">
            <input type="hidden" name="confirm" value="yes" />
            <button
              type="submit"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700"
            >
              Withdraw Application
            </button>
          </form>
        </details>
      ) : null}
    </div>
  );
}

function Panel({
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
      <header className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
        <h2 className="text-xl font-black text-[#071A3D]">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
      </header>
      <div className="space-y-6 p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none transition focus:border-[#071A3D] focus:ring-2 focus:ring-[#071A3D]/10 disabled:bg-slate-100"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  required = false,
  disabled = false,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: string[];
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </span>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        disabled={disabled}
        className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal disabled:bg-slate-100"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckField({
  name,
  title,
  defaultChecked = false,
  required = false,
  disabled = false,
  value,
}: {
  name: string;
  title: string;
  defaultChecked?: boolean;
  required?: boolean;
  disabled?: boolean;
  value?: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        required={required}
        disabled={disabled}
        className="mt-1 h-4 w-4 accent-[#071A3D]"
      />
      <span className="text-sm font-semibold leading-6 text-slate-700">{title}</span>
    </label>
  );
}

function PrimaryButton({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="rounded-xl bg-[#071A3D] px-6 py-3 text-sm font-black text-white transition hover:bg-[#0B2859] disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {children}
    </button>
  );
}

function Alert({
  tone,
  title,
  text,
}: {
  tone: "success" | "error" | "info";
  title: string;
  text: string;
}) {
  const classes = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
  }[tone];

  return (
    <div className={`rounded-2xl border p-4 ${classes}`}>
      <p className="font-black">{title}</p>
      <p className="mt-1 text-sm leading-6">{text}</p>
    </div>
  );
}

function SummaryCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <h3 className="font-black text-[#071A3D]">{title}</h3>
      <div className="mt-4 space-y-3">{children}</div>
    </article>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 pb-2 last:border-0 last:pb-0">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-sm font-semibold text-slate-700">{value}</p>
    </div>
  );
}

function SummaryBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 font-black text-[#071A3D]">{value}</p>
    </div>
  );
}
