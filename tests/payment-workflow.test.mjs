import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260901202311_application_payments_mpesa_prod_compat.sql",
  "utf8",
);
const paymentConfig = readFileSync("src/lib/payments/config.ts", "utf8");
const paymentService = readFileSync(
  "src/lib/payments/application-payments.ts",
  "utf8",
);
const daraja = readFileSync("src/lib/payments/mpesa/daraja.ts", "utf8");
const phone = readFileSync("src/lib/payments/mpesa/phone.ts", "utf8");
const candidateActions = readFileSync("src/lib/candidate/actions.ts", "utf8");
const candidatePage = readFileSync(
  "src/app/candidate/applications/[id]/page.tsx",
  "utf8",
);
const candidateList = readFileSync(
  "src/app/candidate/applications/page.tsx",
  "utf8",
);
const callbackRoute = readFileSync(
  "src/app/api/payments/mpesa/callback/route.ts",
  "utf8",
);
const statusRoute = readFileSync(
  "src/app/api/payments/[reference]/status/route.ts",
  "utf8",
);
const adminConstants = readFileSync("src/lib/admin/constants.ts", "utf8");
const adminTypes = readFileSync("src/lib/admin/types.ts", "utf8");
const adminActions = readFileSync("src/lib/admin/actions.ts", "utf8");

test("payment schema enforces exact fee, receipts, statuses and uniqueness", () => {
  assert.match(migration, /create table if not exists public\.application_payments/);
  assert.match(migration, /receipt_number text unique/);
  assert.match(migration, /receipt_issued_at timestamptz/);
  assert.match(migration, /amount numeric\(12, 2\) not null/);
  assert.match(migration, /purpose text not null default 'CV_DOCUMENT_VERIFICATION'/);
  assert.match(migration, /currency = 'KES'/);
  assert.match(migration, /amount = 2000/);
  assert.match(migration, /'ready_for_payment'/);
  assert.match(migration, /'payment_pending'/);
  assert.match(migration, /application_payments_active_unique_idx/);
  assert.match(migration, /where status in \('initiated', 'pending'\)/);
  assert.match(migration, /application_payments_paid_unique_idx/);
  assert.match(migration, /where status = 'paid'/);
  assert.match(migration, /application_payments_checkout_request_unique_idx/);
  assert.match(migration, /prevent_receipt_reissue/);
  assert.match(migration, /RS-PAY-/);
});

test("payment RLS exposes candidate records but not raw callback payloads", () => {
  assert.match(migration, /alter table public\.application_payments enable row level security/);
  assert.match(migration, /candidate_id = auth\.uid\(\)/);
  assert.match(migration, /public\.is_staff\(\)/);
  assert.match(migration, /alter table public\.application_payment_callbacks enable row level security/);
  assert.match(migration, /revoke all on public\.application_payment_callbacks from anon, authenticated/);
  assert.match(migration, /grant select on public\.application_payments to authenticated/);
  assert.match(migration, /grant select on public\.application_payment_waivers to authenticated/);
  assert.doesNotMatch(migration, /grant select on public\.application_payment_callbacks to authenticated/);
  assert.doesNotMatch(migration, /grant select, insert on public\.application_payment_waivers to authenticated/);
});

test("final paid RPC is atomic and idempotent for duplicate callbacks", () => {
  assert.match(migration, /create or replace function public\.submit_application_after_verified_payment/);
  assert.match(migration, /for update/);
  assert.match(migration, /v_payment\.status <> 'paid'/);
  assert.match(migration, /v_application\.status not in \('ready_for_payment', 'payment_pending', 'submitted'\)/);
  assert.match(migration, /if v_application\.status <> 'submitted' then/);
  assert.match(migration, /if v_payment\.receipt_number is null then/);
  assert.match(migration, /application_payment_finalized/);
  assert.match(migration, /revoke execute on function public\.submit_application_after_verified_payment\(uuid\) from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.submit_application_after_verified_payment\(uuid\) to service_role/);
  assert.doesNotMatch(migration, /application_payment_finalized[\s\S]{0,420}on conflict do nothing/);
  assert.doesNotMatch(migration, /grant execute on function public\.submit_application_after_verified_payment\(uuid\) to authenticated/);
});

test("Daraja integration is feature-flagged and uses server-only credentials", () => {
  assert.match(paymentConfig, /PAYMENTS_ENABLED/);
  assert.doesNotMatch(paymentConfig, /PAYMENT_ENFORCEMENT_ENABLED/);
  assert.match(paymentConfig, /DARAJA_CONSUMER_KEY/);
  assert.match(paymentConfig, /DARAJA_SHORTCODE/);
  assert.match(paymentConfig, /DARAJA_PASSKEY/);
  assert.match(paymentConfig, /DARAJA_TRANSACTION_TYPE/);
  assert.match(paymentConfig, /https:\/\/api\.safaricom\.co\.ke/);
  assert.match(paymentConfig, /https:\/\/sandbox\.safaricom\.co\.ke/);
  assert.match(daraja, /oauth\/v1\/generate\?grant_type=client_credentials/);
  assert.match(daraja, /mpesa\/stkpush\/v1\/processrequest/);
  assert.match(daraja, /mpesa\/stkpushquery\/v1\/query/);
  assert.match(daraja, /CustomerPayBillOnline/);
  assert.match(daraja, /function assertDarajaConfigured\(\)/);
  assert.match(daraja, /function assertPaymentInitiationReady\(\)/);
  assert.match(daraja, /getDarajaAccessToken\(\)[\s\S]{0,180}assertDarajaConfigured\(\)/);
  assert.match(daraja, /initiateDarajaStkPush[\s\S]{0,180}assertPaymentInitiationReady\(\)/);
  assert.match(daraja, /queryDarajaStkPushStatus[\s\S]{0,180}assertDarajaConfigured\(\)/);
  assert.doesNotMatch(daraja, /assertDarajaReady/);
  assert.match(daraja, /Date\.now\(\) \+ 3 \* 60 \* 60 \* 1000/);
  assert.match(daraja, /getUTCFullYear/);
  assert.match(daraja, /responseCode !== "0"/);
  assert.match(paymentService, /if \(!paymentsEnabled\(\)\)/);
  assert.doesNotMatch(`${paymentConfig}\n${daraja}`, /4049477/);
});

test("candidate payment UX does not trust browser supplied amount or create duplicate active payments", () => {
  assert.match(candidateActions, /formData\.get\("fee_acknowledgement"\) !== "yes"/);
  assert.match(candidateActions, /normalizeMpesaPhone\(phone\)/);
  assert.doesNotMatch(candidateActions, /formData\.get\("amount"\)/);
  assert.match(candidateActions, /createOrReuseApplicationPayment\(\{\s*applicationId,\s*candidateId: context\.user\.id,\s*phoneNumber: phone,/);
  assert.match(paymentService, /findReusablePayment/);
  assert.match(paymentService, /\.in\("status", ACTIVE_PAYMENT_STATUSES\)/);
  assert.match(paymentService, /loadPayableApplication/);
  assert.match(paymentService, /\["ready_for_payment", "payment_pending"\]\.includes\(applicationStatus\)/);
  assert.match(paymentService, /Complete the application review before starting payment/);
  assert.match(paymentService, /\["personal", "passport", "declarations", "documents"\]/);
  assert.match(paymentService, /job\?\.status !== "published"/);
  assert.match(paymentService, /deadline && deadline < today/);
  assert.match(paymentService, /vacancies !== null && vacancies <= 0/);
  assert.match(candidatePage, /Continue to Verification Fee/);
  assert.match(candidatePage, /Pay & Submit/);
  assert.match(candidatePage, /disabled=\{!paymentState\.paymentsEnabled\}/);
  assert.match(candidateList, /ready_for_payment/);
  assert.match(candidateList, /Pay & Submit/);
});

test("payment initiation splits candidate validation from privileged payment writes", () => {
  assert.match(paymentService, /const candidateClient = await createClient\(\)/);
  assert.match(paymentService, /const admin = createAdminClient\(\)/);
  assert.match(paymentService, /loadPayableApplication\(\s*candidateClient,\s*applicationId,\s*candidateId\s*\)/);
  assert.match(paymentService, /findReusablePayment\(admin, applicationId\)/);
  assert.match(paymentService, /admin\s*\.\s*from\("application_payments"\)\s*\.\s*insert/);
  assert.match(paymentService, /admin\s*\.\s*from\("applications"\)\s*\.\s*update\(\{ status: "payment_pending" \}\)/);
  assert.match(paymentService, /startStkForPayment\(\{\s*admin,/);
  assert.match(paymentService, /job:jobs\(id, status, application_deadline, vacancies, employer:employers\(verification_status, is_active\)\)/);
  assert.match(paymentService, /employer\?\.verification_status !== "verified"/);
  assert.match(paymentService, /employer\?\.is_active !== true/);
  assert.doesNotMatch(migration, /grant insert on public\.application_payments to authenticated/);
  assert.doesNotMatch(migration, /grant update on public\.application_payments to authenticated/);
});

test("payment failures keep stage and Supabase details in internal logs only", () => {
  assert.match(paymentService, /function logPaymentFailure/);
  assert.match(paymentService, /stage,/);
  assert.match(paymentService, /code: error\?\.code/);
  assert.match(paymentService, /message: error\?\.message/);
  assert.match(paymentService, /"candidate_payable_lookup"/);
  assert.match(paymentService, /"payment_insert"/);
  assert.match(paymentService, /"application_payment_pending_update"/);
  assert.match(paymentService, /"stk_persist"/);
  assert.match(candidateActions, /payment_error=stk_unavailable/);
  assert.doesNotMatch(candidateActions, /code: error\?\.code|result_description|checkout_request_id/);
});

test("M-Pesa callback is server-controlled and correlates known checkout requests", () => {
  assert.match(callbackRoute, /export const dynamic = "force-dynamic"/);
  assert.match(callbackRoute, /processMpesaCallbackPayload/);
  assert.match(paymentService, /extractMpesaCallback/);
  assert.match(paymentService, /\.eq\("checkout_request_id", callback\.checkoutRequestId\)/);
  assert.match(paymentService, /payload_hash/);
  assert.match(paymentService, /canonicalJson/);
  assert.match(paymentService, /Unknown payment request/);
  assert.match(paymentService, /queryDarajaStkPushStatus/);
  assert.match(paymentService, /providerConfirmedSuccess/);
  assert.match(paymentService, /verification\.merchantRequestId === callback\.merchantRequestId/);
  assert.match(paymentService, /Payment callback recorded pending provider verification/);
  assert.match(paymentService, /Payment callback did not pass provider verification/);
  assert.match(migration, /create or replace function public\.record_mpesa_callback/);
  assert.match(migration, /for update/);
  assert.match(migration, /p_provider_confirmed_success is not true/);
  assert.match(migration, /p_verified_amount is not null and p_verified_amount <> v_payment\.amount/);
  assert.match(migration, /revoke execute on function public\.record_mpesa_callback\(text, text, text, text, text, text, numeric, text, boolean\) from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.record_mpesa_callback\(text, text, text, text, text, text, numeric, text, boolean\) to service_role/);
  assert.match(paymentService, /submit_application_after_verified_payment/);
  assert.doesNotMatch(callbackRoute, /requireCandidate|requireStaff/);
  assert.match(statusRoute, /getCandidatePaymentByReference/);
});

test("waivers use capability checks and remain staff controlled", () => {
  assert.match(adminTypes, /"payments\.waive"/);
  assert.match(adminConstants, /payments\.waive/);
  assert.match(adminActions, /hasCapability\(context, "payments\.waive"\)/);
  assert.match(adminActions, /admin_waive_application_payment/);
  assert.doesNotMatch(adminActions, /p_waived_by/);
  assert.match(migration, /create table if not exists public\.application_payment_waivers/);
  assert.match(migration, /v_actor := auth\.uid\(\)/);
  assert.match(migration, /public\.has_payment_waive_capability\(v_actor\)/);
  assert.match(migration, /p\.profile_type = 'super_admin'/);
  assert.match(migration, /sr\.role = 'super_admin'/);
  assert.match(migration, /waived_by[\s\S]{0,140}v_actor/);
  assert.match(migration, /application_payment_waivers_active_unique_idx/);
  assert.match(migration, /revoke execute on function public\.admin_waive_application_payment\(uuid, text\) from public, anon/);
  assert.match(migration, /grant execute on function public\.admin_waive_application_payment\(uuid, text\) to authenticated/);
  assert.doesNotMatch(migration, /p_waived_by/);
  assert.match(migration, /drop function if exists public\.admin_waive_application_payment\(uuid, text, uuid, text\)/);
  assert.doesNotMatch(migration, /create or replace function public\.admin_waive_application_payment\(\s*p_application_id uuid,\s*p_payment_purpose text,\s*p_waived_by uuid/);
});

test("database payment enforcement switch gates the old candidate submission RPC", () => {
  assert.match(migration, /create table if not exists public\.application_payment_settings/);
  assert.match(migration, /payment_enforcement_enabled boolean not null default false/);
  assert.match(migration, /values \(\s*true,\s*false\s*\)/);
  assert.match(migration, /revoke all on public\.application_payment_settings from anon, authenticated/);
  assert.match(migration, /create or replace function public\.candidate_submit_application/);
  assert.match(migration, /v_enforcement_enabled := public\.application_payment_enforcement_enabled\(\)/);
  assert.match(migration, /if v_enforcement_enabled then/);
  assert.match(migration, /ap\.status = 'paid'/);
  assert.match(migration, /ap\.job_id = v_job_id/);
  assert.match(migration, /aw\.active = true/);
  assert.match(migration, /raise exception 'PAYMENT_REQUIRED'/);
  assert.match(migration, /a\.candidate_id = auth\.uid\(\)/);
  assert.match(migration, /j\.status = 'published'/);
  assert.match(migration, /j\.application_deadline is null or j\.application_deadline >= current_date/);
  assert.match(migration, /j\.vacancies is null or j\.vacancies > 0/);
  assert.match(migration, /grant execute on function public\.candidate_submit_application\(uuid, text, text, text, text\) to authenticated/);
});

test("Kenyan M-Pesa phone normalization accepts local and international forms", () => {
  assert.match(phone, /\^\(07\|01\)\\d\{8\}\$/);
  assert.match(phone, /\^254\(7\|1\)\\d\{8\}\$/);
  assert.match(phone, /replace\(/);
  assert.match(phone, /Enter a valid Kenyan M-Pesa phone number/);
});



