# Cloudflare Workers Deployment

This project is configured for Cloudflare Workers through `@opennextjs/cloudflare`.

## Required Variables

Configure these in Cloudflare Workers build/deployment settings. Do not commit real values.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `RESEND_FROM_EMAIL`
- `RESEND_FROM_NAME`
- `RESEND_REPLY_TO`

`NEXT_PUBLIC_SITE_URL` should be `https://redstone.co.ke` for production so auth redirects and canonical URLs use the live domain.

Configure these as Worker secrets:

- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `OPENAI_API_KEY`
- `AI_INTERNAL_SECRET`
- `AI_RATE_LIMIT_SALT`

`AI_RATE_LIMIT_SALT` must be a long random server-only value. The website AI hashes the Cloudflare client IP with this salt before rate-limit storage; raw visitor IP addresses are not stored in the AI rate-limit table.

Keep `AI_WEBSITE_CHAT_ENABLED=false` until the Red Stone website assistant is intentionally activated. Set it to `true` only after `OPENAI_API_KEY`, `AI_RATE_LIMIT_SALT`, and the production checks are complete. The widget and public AI route fail closed when any required AI protection is missing.

Website AI abuse-control defaults:

- `AI_WEBSITE_RATE_LIMIT=30`
- `AI_WEBSITE_RATE_WINDOW_SECONDS=600`

These values mean 30 valid AI messages per hashed visitor identity in a 10-minute window. Adjust only after reviewing real traffic and candidate conversation lengths.

Optional AI model overrides:

- `AI_FAST_MODEL=gpt-5.6-luna`
- `AI_REASONING_MODEL=gpt-5.6-terra`

`wrangler.jsonc` sets `keep_vars` to `true` so CLI deploys preserve dashboard-managed variables.

## First Deployment

Do not run this until deployment is approved:

```bash
npm run deploy
```

Before deploying, inspect the local Cloudflare build:

```bash
npm run build:cloudflare
npm run cf-typegen
wrangler deploy --dry-run
```

If the local Wrangler CLI hangs, call the local binary directly:

```bash
.\node_modules\.bin\wrangler.cmd deploy --dry-run
```

## Cloudflare Git Settings

- Build command: `npm run build:cloudflare`
- Deploy command: `npx opennextjs-cloudflare deploy`
- Version command: `npx opennextjs-cloudflare upload`

## Domain Setup

Before routing production traffic:

- Add `redstone.co.ke` to Cloudflare DNS or confirm the existing zone is active.
- Configure `redstone.co.ke` and `www.redstone.co.ke` as custom domains or routes for the Worker.
- Point DNS records to Cloudflare as required by the zone setup.
- Add `https://redstone.co.ke/auth/callback` and any required `www` callback URL to Supabase Auth redirect URLs.
- Set `NEXT_PUBLIC_SITE_URL=https://redstone.co.ke` in Cloudflare build/runtime variables.

## Caching

Static `_next` assets are cached through `public/_headers`.

R2 incremental caching is not configured yet. Add an R2 binding named `NEXT_INC_CACHE_R2_BUCKET` and update `open-next.config.ts` only after a bucket is intentionally provisioned.
