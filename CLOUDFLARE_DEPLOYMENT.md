# Cloudflare Workers Deployment

This project is configured for Cloudflare Workers through `@opennextjs/cloudflare`.

## Required Variables

Configure these in Cloudflare Workers build/deployment settings. Do not commit real values.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

`NEXT_PUBLIC_SITE_URL` should be `https://redstone.co.ke` for production so auth redirects and canonical URLs use the live domain.

## First Deployment

Do not run this until deployment is approved:

```bash
npm run deploy
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
