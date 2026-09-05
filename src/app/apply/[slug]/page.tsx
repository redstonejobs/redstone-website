import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { startApplication } from "@/lib/candidate/actions";
import { getPublishedJobBySlug } from "@/lib/candidate/data";
import { CONTACT } from "@/lib/public/site";
import { createClient } from "@/utils/supabase/server";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type ApplyAccess =
  | { status: "candidate" }
  | { status: "candidate_required"; profileType: string | null }
  | { status: "profile_missing"; userId: string }
  | { status: "temporary_error" }
  | { status: "unauthenticated" };

/**
 * Lightweight application entry point used by every real vacancy.
 *
 * Keep this route intentionally small for Cloudflare Workers: it validates one
 * job, checks one signed-in profile, then lets the database RPC atomically
 * create-or-resume one application before redirecting to the full candidate
 * application page. The application wizard itself does not render here.
 */
export default async function ApplyForJobPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const applyPath = `/apply/${slug}`;
  const requestedError = errorParam((await searchParams)?.error);

  const { job, error: jobError } = await getPublishedJobBySlug(slug);

  if (jobError) {
    console.error("[candidate] apply job lookup failed", {
      slug,
      code: jobError.code ?? null,
    });

    return <TemporaryApplyError slug={slug} />;
  }

  if (!job) notFound();

  const access = await getApplyCandidateAccess(applyPath);

  if (access.status === "unauthenticated") {
    redirect(`/login?next=${encodeURIComponent(applyPath)}`);
  }

  if (access.status === "temporary_error") {
    return <TemporaryApplyError slug={slug} jobTitle={typeof job.title === "string" ? job.title : undefined} />;
  }

  if (access.status === "profile_missing") {
    console.error("[candidate] apply account profile missing", {
      slug,
      user_id: access.userId,
    });

    return (
      <ApplyAccountSetupError
        slug={slug}
        applyPath={applyPath}
        jobTitle={String(job.title ?? "this job")}
      />
    );
  }

  if (access.status === "candidate_required" || requestedError === "candidate_required") {
    return (
      <CandidateRequiredNotice
        slug={slug}
        applyPath={applyPath}
        jobTitle={String(job.title ?? "this job")}
        profileType={access.status === "candidate_required" ? access.profileType : null}
      />
    );
  }

  if (requestedError) {
    return (
      <ApplicationStartError
        slug={slug}
        error={requestedError}
        jobTitle={String(job.title ?? "this job")}
      />
    );
  }

  // candidate_start_application is idempotent: it returns the existing
  // candidate/job application when one already exists, otherwise it creates a
  // single draft. startApplication redirects to that application on success.
  await startApplication(slug);

  // startApplication always redirects on success or handled failure.
  return null;
}

async function getApplyCandidateAccess(applyPath: string): Promise<ApplyAccess> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) return { status: "unauthenticated" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("profile_type, is_active")
    .eq("id", data.user.id)
    .maybeSingle<{ profile_type: string | null; is_active: boolean | null }>();

  if (profileError) {
    console.error("[candidate] apply profile lookup failed", {
      applyPath,
      code: profileError.code ?? null,
    });
    return { status: "temporary_error" };
  }

  if (!profile) return { status: "profile_missing", userId: data.user.id };

  if (profile.profile_type !== "candidate" || profile.is_active !== true) {
    console.warn("[candidate] apply blocked for non-candidate account", {
      applyPath,
      profile_type: profile.profile_type,
      is_active: profile.is_active,
    });

    return {
      status: "candidate_required",
      profileType: profile.profile_type,
    };
  }

  return { status: "candidate" };
}

function CandidateRequiredNotice({
  slug,
  applyPath,
  jobTitle,
  profileType,
}: {
  slug: string;
  applyPath: string;
  jobTitle: string;
  profileType: string | null;
}) {
  const accountLabel = profileType ? `${profileType.replaceAll("_", " ")} account` : "this account";

  return (
    <ApplyMessage title="A candidate account is required to apply for this job.">
      <p>
        You are signed in with {accountLabel}. Staff, administrator and employer
        accounts cannot submit candidate applications.
      </p>
      <p className="mt-3">
        Sign out, then sign in with an active candidate account or create a new
        candidate account. Your selected job will be preserved.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <form action={`/auth/logout?next=${encodeURIComponent(applyPath)}`} method="post">
          <button className="rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]">
            Sign out and use a candidate account
          </button>
        </form>
        <Link
          href={`/register?next=${encodeURIComponent(applyPath)}`}
          className="rounded-md border border-[#071A3D] px-5 py-3 text-sm font-black text-[#071A3D]"
        >
          Create candidate account
        </Link>
        <Link
          href={`/jobs/${slug}`}
          className="rounded-md border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700"
        >
          Return to job details
        </Link>
      </div>
      <p className="mt-4 text-sm text-slate-500">Job: {jobTitle}</p>
    </ApplyMessage>
  );
}

function ApplyAccountSetupError({
  slug,
  applyPath,
  jobTitle,
}: {
  slug: string;
  applyPath: string;
  jobTitle: string;
}) {
  return (
    <ApplyMessage title="Your candidate account setup could not be completed.">
      <p>
        Your sign-in account exists, but its Red Stone profile record is missing.
        We have not created or changed any staff, administrator or employer profile.
      </p>
      <p className="mt-3">
        Try again once. If the problem remains, contact {CONTACT.emails.support} so
        the account setup can be reviewed safely.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={applyPath}
          className="rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]"
        >
          Retry application
        </Link>
        <form action={`/auth/logout?next=${encodeURIComponent(applyPath)}`} method="post">
          <button className="rounded-md border border-[#071A3D] px-5 py-3 text-sm font-black text-[#071A3D]">
            Sign out
          </button>
        </form>
        <Link
          href={`/jobs/${slug}`}
          className="rounded-md border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700"
        >
          Return to job details
        </Link>
      </div>
      <p className="mt-4 text-sm text-slate-500">Job: {jobTitle}</p>
    </ApplyMessage>
  );
}

function ApplicationStartError({
  slug,
  error,
  jobTitle,
}: {
  slug: string;
  error: string;
  jobTitle: string;
}) {
  const text =
    error === "job_not_available"
      ? "That job is no longer accepting applications."
      : "We could not start this application right now.";

  return (
    <ApplyMessage title={text}>
      <p>
        Please retry once. If the problem continues, contact {CONTACT.emails.support}.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/apply/${slug}`}
          className="rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]"
        >
          Retry application
        </Link>
        <Link
          href={`/jobs/${slug}`}
          className="rounded-md border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700"
        >
          Return to job details
        </Link>
      </div>
      <p className="mt-4 text-sm text-slate-500">Job: {jobTitle}</p>
    </ApplyMessage>
  );
}

function TemporaryApplyError({ slug, jobTitle }: { slug: string; jobTitle?: string }) {
  return (
    <ApplyMessage title="Application service is temporarily unavailable.">
      <p>
        The vacancy could not be checked right now. No application was submitted
        and no payment was requested. Please retry shortly.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={`/apply/${slug}`}
          className="rounded-md bg-[#D4AF37] px-5 py-3 text-sm font-black text-[#071A3D]"
        >
          Retry
        </Link>
        <Link
          href={`/jobs/${slug}`}
          className="rounded-md border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700"
        >
          Return to job details
        </Link>
      </div>
      {jobTitle ? <p className="mt-4 text-sm text-slate-500">Job: {jobTitle}</p> : null}
    </ApplyMessage>
  );
}

function ApplyMessage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#F3F4F6] px-4 py-10">
      <section className="mx-auto max-w-3xl rounded-md border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-black uppercase tracking-wide text-[#B8860B]">Application Access</p>
        <h1 className="mt-2 text-3xl font-black text-[#071A3D]">{title}</h1>
        <div className="mt-4 leading-7 text-slate-600">{children}</div>
      </section>
    </main>
  );
}

function errorParam(value: string | string[] | undefined) {
  return typeof value === "string" ? value : null;
}
