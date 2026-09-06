import "server-only";

import { cookies } from "next/headers";
import {
  normalizeEmailContact,
  normalizePhoneContact,
} from "@/lib/referrals/contact-normalization";
import { createAdminClient } from "@/utils/supabase/admin";

export const STAFF_REFERRAL_COOKIE = "redstone_referral_code";

const STATUS_RANK: Record<string, number> = {
  lead: 0,
  contacted: 1,
  registered: 2,
  applied: 3,
  processing: 4,
  placed: 5,
  closed: 6,
};

type ReferralContext = {
  status?: "registered" | "applied";
  applicationId?: string;
  jobSlug?: string;
};

function normalizeReferralCode(value: string | undefined | null) {
  const code = (value ?? "").trim().toUpperCase();
  return /^RSE-[A-Z0-9]{6}$/.test(code) ? code : null;
}

function progressedStatus(current: string | null | undefined, desired: string) {
  const currentRank = STATUS_RANK[current ?? ""] ?? -1;
  const desiredRank = STATUS_RANK[desired] ?? 0;
  return desiredRank > currentRank ? desired : current ?? desired;
}

export async function attributeCandidateFromCurrentReferral(
  candidateId: string,
  context: ReferralContext = {},
) {
  const cookieStore = await cookies();
  const referralCode = normalizeReferralCode(
    cookieStore.get(STAFF_REFERRAL_COOKIE)?.value,
  );

  if (!referralCode) return null;

  const admin = createAdminClient();

  const { data: referredStaff, error: staffError } = await admin
    .from("profiles")
    .select("id, full_name, staff_id, referral_code, is_active, profile_type")
    .eq("referral_code", referralCode)
    .eq("is_active", true)
    .in("profile_type", ["staff", "admin", "super_admin"])
    .maybeSingle();

  if (staffError || !referredStaff) return null;

  const { data: activeRole } = await admin
    .from("staff_roles")
    .select("role")
    .eq("user_id", referredStaff.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (!activeRole) return null;

  const { data: candidate, error: candidateError } = await admin
    .from("profiles")
    .select(
      "id, full_name, phone, nationality, country, referred_by_staff_id, referral_attributed_at",
    )
    .eq("id", candidateId)
    .eq("profile_type", "candidate")
    .maybeSingle();

  if (candidateError || !candidate) return null;

  if (!candidate.referred_by_staff_id) {
    await admin
      .from("profiles")
      .update({
        referred_by_staff_id: referredStaff.id,
        referral_attributed_at: new Date().toISOString(),
      })
      .eq("id", candidateId)
      .is("referred_by_staff_id", null);
  }

  const { data: attributedCandidate } = await admin
    .from("profiles")
    .select(
      "id, full_name, phone, nationality, country, referred_by_staff_id, referral_attributed_at",
    )
    .eq("id", candidateId)
    .maybeSingle();

  if (!attributedCandidate?.referred_by_staff_id) return null;

  const staffId = attributedCandidate.referred_by_staff_id;

  // First-touch attribution is permanent: a later referral link never steals a client.
  if (staffId !== referredStaff.id) {
    return { staffId, attributed: false };
  }

  const { data: authUser } = await admin.auth.admin.getUserById(candidateId);
  const email = authUser.user?.email ?? null;

  let interestedJob: string | null = null;
  let preferredCountry: string | null = null;

  if (context.jobSlug) {
    const { data: job } = await admin
      .from("jobs")
      .select("title, country")
      .eq("slug", context.jobSlug)
      .maybeSingle();

    interestedJob = job?.title ?? null;
    preferredCountry = job?.country ?? null;
  }

  const desiredStatus = context.status ?? "registered";

  const { data: linkedRows } = await admin
    .from("staff_clients")
    .select("id, staff_user_id, status, source")
    .eq("candidate_user_id", candidateId)
    .order("created_at", { ascending: true })
    .limit(1);

  let clientRow = linkedRows?.[0] ?? null;

  if (!clientRow) {
    const { data: unlinkedRows } = await admin
      .from("staff_clients")
      .select("id, staff_user_id, status, source, email, phone")
      .eq("staff_user_id", staffId)
      .is("candidate_user_id", null)
      .order("created_at", { ascending: false })
      .limit(50);

    const candidateEmail = normalizeEmailContact(email);
    const candidatePhone = normalizePhoneContact(attributedCandidate.phone);

    clientRow =
      unlinkedRows?.find((row) => {
        const emailMatches =
          candidateEmail && normalizeEmailContact(row.email) === candidateEmail;
        const phoneMatches =
          candidatePhone && normalizePhoneContact(row.phone) === candidatePhone;
        return Boolean(emailMatches || phoneMatches);
      }) ?? null;
  }

  const nextStatus = progressedStatus(clientRow?.status, desiredStatus);

  if (clientRow && clientRow.staff_user_id === staffId) {
    await admin
      .from("staff_clients")
      .update({
        candidate_user_id: candidateId,
        full_name: attributedCandidate.full_name || "Candidate",
        email,
        phone: attributedCandidate.phone,
        nationality: attributedCandidate.nationality,
        country: attributedCandidate.country,
        interested_job: interestedJob ?? undefined,
        preferred_country: preferredCountry ?? undefined,
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", clientRow.id)
      .eq("staff_user_id", staffId);
  } else if (!clientRow) {
    await admin.from("staff_clients").insert({
      staff_user_id: staffId,
      candidate_user_id: candidateId,
      full_name: attributedCandidate.full_name || "Candidate",
      email,
      phone: attributedCandidate.phone,
      nationality: attributedCandidate.nationality,
      country: attributedCandidate.country,
      interested_job: interestedJob,
      preferred_country: preferredCountry,
      status: nextStatus,
      source: "referral_link",
      notes: "Automatically attributed from the staff referral link.",
    });
  }

  if (context.applicationId && desiredStatus === "applied") {
    const wasAlreadyApplied =
      clientRow && (STATUS_RANK[clientRow.status] ?? -1) >= STATUS_RANK.applied;

    if (!wasAlreadyApplied) {
      await admin.from("admin_audit_logs").insert({
        actor_user_id: staffId,
        actor_role: "staff_referral",
        action: "staff_referral_application_attributed",
        entity_type: "application",
        entity_id: context.applicationId,
        description: "Candidate application attributed to a staff referral link.",
        metadata: {
          referral_code: referralCode,
          staff_user_id: staffId,
          candidate_user_id: candidateId,
          job_slug: context.jobSlug ?? null,
          interested_job: interestedJob,
          preferred_country: preferredCountry,
        },
      });
    }
  }

  return {
    staffId,
    referralCode,
    attributed: true,
  };
}
