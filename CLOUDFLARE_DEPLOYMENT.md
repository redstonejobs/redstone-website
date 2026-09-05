# Cloudflare Workers Production Deployment

Red Stone is deployed as a full-stack Next.js application on Cloudflare Workers through `@opennextjs/cloudflare`.

## Deployment architecture

`GitHub main -> Cloudflare Workers Builds -> OpenNext build -> redstone-website Worker -> Supabase / Resend`

Production traffic should use `https://redstone.co.ke`. Keep `www.redstone.co.ke` as an accepted alias and redirect/canonicalize it to the apex domain where appropriate.

## Cloudflare Workers Builds

Connect the private GitHub repository `redstonejobs/redstone-website` to the existing Worker and use `main` as the production branch.

Recommended commands:

- Build command: `npm run build:cloudflare`
- Deploy command: `npx opennextjs-cloudflare deploy`
- Preview/version command: `npx opennextjs-cloudflare upload`

Branches other than `main` should be treated as preview builds. Do not promote a preview to production until the application has been reviewed.

## Required configuration

### Public/build variables

These are required by application code and may be exposed to the browser:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL=https://redstone.co.ke`

### Server-only secrets

These must never be committed or prefixed with `NEXT_PUBLIC_`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

### Server-side email settings

- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME` (optional; defaults to Red Stone Employment Agency)
- `RESEND_REPLY_TO` (optional)
- `HR_SUPPORT_EMAIL` (optional fallback reply-to)

Keep production values in Cloudflare and the relevant provider secret stores. The repository contains names and examples only.

## GitHub quality gate

Pull requests should pass `.github/workflows/quality-gate.yml` before merge. The workflow is validation-only and does not deploy.

It runs:

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. `npm run build:cloudflare`

The workflow uses safe non-production placeholder environment values for build-time validation. Never copy production Supabase, Resend, Cloudflare, or other credentials into the workflow file.

## Worker configuration

`wrangler.jsonc` is the source-controlled production baseline. It currently provides:

- Workers Static Assets binding for `.open-next/assets`
- Node.js compatibility
- `keep_vars: true` so dashboard-managed non-secret variables are preserved during deployments
- source-map uploads for readable production stack traces
- Smart Placement so dynamic requests can be placed closer to upstream services such as Supabase when Cloudflare determines that this improves latency
- Workers Logs enabled for production diagnostics
- automatic traces disabled by default to avoid unnecessary telemetry volume/cost until intentionally enabled

Do not add account IDs, tokens, API keys, database credentials, or service-role keys to `wrangler.jsonc`.

## Domain and authentication setup

Before routing production traffic:

1. Confirm the `redstone.co.ke` Cloudflare zone is active.
2. Attach `redstone.co.ke` and `www.redstone.co.ke` to the `redstone-website` Worker as custom domains/routes.
3. Set `NEXT_PUBLIC_SITE_URL=https://redstone.co.ke` in the Cloudflare build/runtime environment.
4. In Supabase Auth, allow `https://redstone.co.ke/auth/callback`.
5. Add the `www` callback only if users can actually complete authentication on the `www` hostname.
6. Confirm HTTPS is enforced before enabling strict transport policies.

## Security controls to configure in Cloudflare

Cloudflare controls are defense-in-depth; application authorization must remain enforced in server code and Supabase RLS/RPC policies.

Recommended dashboard controls:

- Rate-limit `/login`, `/auth/*`, password reset flows, document download/view routes, and mutation-heavy endpoints.
- Enable managed WAF rules where available.
- Block obvious automated abuse rather than broad geographic traffic unless there is a documented business reason.
- Review Security Events before tightening rules so legitimate candidates, employers, and staff are not blocked.
- Keep admin pages uncached and never cache authenticated HTML responses.

## Observability and operations

After each production deployment:

1. Check the Cloudflare build result and deployed version.
2. Verify `/`, `/jobs`, `/login`, `/admin` access control, and one candidate flow.
3. Review Workers Logs for new exceptions.
4. Confirm Supabase authentication callbacks work on the live domain.
5. Confirm transactional email works if the release touches onboarding, password reset, staff invitations, or notifications.
6. Roll back to the previous known-good Worker version if a critical regression appears.

Source maps are uploaded so Cloudflare can remap production exceptions to the original TypeScript/JavaScript source.

## Caching

Static `/_next/static/*` assets are cached with a long immutable cache policy through `public/_headers`.

R2-backed incremental caching is intentionally not configured yet. Only add a binding such as `NEXT_INC_CACHE_R2_BUCKET` after an R2 bucket has been provisioned, tested in preview, and the OpenNext cache configuration has been reviewed.

## Deployment safety

Do not deploy directly from an unreviewed local working tree. Preferred flow:

1. Create a feature branch.
2. Make and inspect the changes.
3. Wait for the GitHub quality gate to pass.
4. Use Cloudflare's preview/version build for the branch where available.
5. Review authentication, database, email, and document-access behavior.
6. Merge to `main` only after approval.
7. Let Cloudflare Workers Builds perform the production deployment.

See `docs/cloudflare-production-runbook.md` for the operational checklist.
