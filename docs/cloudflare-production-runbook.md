# Cloudflare Production Runbook

This runbook is for operating the `redstone-website` Cloudflare Worker safely.

## 1. Production baseline

- Worker: `redstone-website`
- Production branch: `main`
- Primary URL: `https://redstone.co.ke`
- Secondary hostname: `https://www.redstone.co.ke`
- Runtime adapter: `@opennextjs/cloudflare`
- Database/Auth: Supabase
- Transactional email: Resend

## 2. Before merging to main

Confirm the change has been reviewed on a feature branch.

Minimum checks for application changes:

- Lint/tests relevant to the changed area pass.
- The Cloudflare production build passes in CI.
- No real `.env`, credentials, access tokens, API keys, service-role keys, private certificates, or customer data are committed.
- Authentication redirects still target `https://redstone.co.ke`.
- Admin/candidate/employer authorization remains server-side.
- Database schema changes are represented as new Supabase migrations; do not edit a migration that has already been applied in production.
- New environment variables are documented in `.env.example` and configured in Cloudflare before deployment.

## 3. GitHub quality gate

Pull requests should pass `.github/workflows/quality-gate.yml` before merge. The workflow intentionally does not deploy anything. It runs:

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. `npm run build:cloudflare`

The workflow uses non-production placeholder environment values so build-time checks never require production secrets.

If a check fails, fix the branch and re-run it. Do not bypass the gate just to get a deployment through.

If GitHub Actions is disabled for the repository, enable Actions before relying on this gate. Until the workflow produces a successful run, treat the pull request as not yet production-validated.

## 4. Cloudflare build configuration

Under Worker Settings -> Builds, confirm the Git repository is `redstonejobs/redstone-website` and production branch is `main`.

Use:

- Build: `npm run build:cloudflare`
- Deploy: `npx opennextjs-cloudflare deploy`
- Preview/version: `npx opennextjs-cloudflare upload`

Do not store production secrets in the Git repository.

## 5. Environment configuration

Public/build variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL=https://redstone.co.ke`

Server-only secrets:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

Email configuration:

- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `RESEND_REPLY_TO`
- `HR_SUPPORT_EMAIL`

When rotating a credential, update the provider first where appropriate, update Cloudflare, test, then revoke the old credential.

## 6. DNS and custom domains

Confirm the zone remains active in Cloudflare and that the Worker receives both apex and `www` traffic as intended.

Do not change DNS and application deployment simultaneously unless necessary. Keeping these as separate changes makes rollback easier.

For authentication, confirm Supabase redirect allowlists match the hostnames actually used by the application.

## 7. Security controls

Use Cloudflare security controls as a traffic-protection layer, not as a replacement for application authorization.

Prioritize protection for:

- `/login`
- `/auth/*`
- `/forgot-password`
- `/reset-password`
- candidate/admin document routes
- endpoints or server actions that create/update records

Roll out rate limits gradually. Start in logging/observation mode when possible, check legitimate traffic patterns, then enforce.

Never cache personalized/authenticated HTML, signed document URLs, or responses containing private candidate/employer information.

## 8. Observability

Workers Logs are enabled in `wrangler.jsonc`. Source maps are uploaded to make production stack traces useful.

Review after each significant release:

- uncaught exceptions
- authentication callback failures
- Supabase request failures/timeouts
- Resend/API errors
- unexpected 401/403/404/5xx increases
- latency regressions

Automatic tracing is currently disabled. Enable sampled tracing intentionally if deeper latency diagnostics are needed and review Cloudflare's current observability pricing before doing so.

## 9. Post-deployment smoke test

After a production deployment, check:

1. Homepage loads over HTTPS.
2. Public jobs list and at least one job detail page load.
3. Candidate login works.
4. Invalid/unauthorized access to `/admin` is rejected or redirected correctly.
5. Candidate portal access works for a valid candidate account.
6. Employer portal access works if the release touched employer code.
7. Supabase auth callback completes correctly.
8. Document access remains private and authorization-gated.
9. Email sends successfully if the release touched email-dependent flows.
10. Cloudflare logs show no new high-volume errors.

## 10. Rollback

If a critical regression occurs:

1. Stop additional production changes.
2. Identify the last known-good Cloudflare Worker version.
3. Roll back/promote that version in Cloudflare.
4. Verify the primary user flows again.
5. Revert the offending Git change on a new branch if necessary.
6. Investigate using Workers Logs and the source-mapped stack trace.

For database migrations, application rollback and database rollback are separate concerns. Prefer forward-fix migrations when destructive rollback would risk data loss.

## 11. Performance roadmap

Current optimizations:

- immutable caching for `/_next/static/*`
- Workers Static Assets binding
- Smart Placement for dynamic Worker execution

Future options to evaluate in preview before production:

- R2-backed OpenNext incremental cache
- sampled Workers tracing
- tighter route-specific WAF/rate-limit rules
- external OpenTelemetry export if operational volume justifies it
- migration from OpenNext to Cloudflare's currently preferred Next.js path only after a compatibility test proves the application is ready

Do not migrate deployment adapters solely for novelty. Stability of authentication, server actions, document access, and Supabase integration takes priority.
