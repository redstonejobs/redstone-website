# Automatic External Job Imports

This feature adds a source-aware automatic vacancy pipeline without weakening the existing Red Stone employer-verification rules.

## Architecture

```text
FoundRole approved feed / authenticated MCP       Canada Job Bank authorized XML feed
                    \                               /
                     \                             /
                      -> secure import endpoint <-
                               |
                      normalize + classify
                               |
                  duplicate / quality screening
                               |
                    auto-publish / hold / reject
                               |
                          Supabase jobs
                               |
             /jobs search + /opportunities/[slug]
                               |
                       Apply at original source
```

Red Stone-authorized employer vacancies continue to use the existing `/jobs/[slug]` and `/apply/[slug]` recruitment workflow. Syndicated external vacancies use `/opportunities/[slug]` and their Apply button opens the original source. The `/apply/[slug]` route also performs a defensive external-source redirect so an external vacancy cannot accidentally create a Red Stone candidate application.

## Publication policy

The importer does not blindly publish every result. It records every source item and then applies these decisions:

- Explicit statement that existing Canadian work authorization is required, or that sponsorship is unavailable: reject and archive any previously imported copy.
- Equivalent vacancy already published from another source: mark duplicate.
- Quality score below the source threshold: hold for review.
- No sufficiently strong foreign-worker/international-applicant signal when that source requires one: hold for review.
- Passed source, quality and foreign-worker checks: publish automatically.

`LMIA requested` and `LMIA approved` are separate statuses. An LMIA request is never upgraded to approved by inference.

## FoundRole

The adapter supports two production modes:

1. `FOUNDROLE_FEED_URL`: preferred when FoundRole provides Red Stone with an approved partner/server feed.
2. `FOUNDROLE_MCP_ACCESS_TOKEN`: calls the official remote MCP endpoint (`https://www.foundrole.com/mcp`) and invokes `jobs_search` through Streamable HTTP.

FoundRole's normal remote MCP setup uses OAuth. The ChatGPT FoundRole connection is an authenticated ChatGPT connection; its credentials are not exposed to the deployed Red Stone website. Unattended production imports therefore require a FoundRole-approved server credential/feed or a production-compatible OAuth arrangement. Do not copy browser cookies or personal login credentials into the website.

The initial FoundRole search configuration is stored in `job_import_sources.config` and focuses on current Canada roles such as caregiver, cleaning, housekeeping, warehouse, security, driving, construction, farm and hotel work. It can be changed in the database without redesigning the importer.

## Canada Job Bank

The application deliberately does **not** scrape Job Bank pages. Job Bank's normal service terms prohibit automated scripts/robots/screen scrapers/automated query programs/AI access. Job Bank separately offers approved XML-feed access for job boards that qualify.

Until Red Stone receives an authorized feed:

- `job_import_sources.provider = 'jobbank'` remains disabled.
- `JOBBANK_XML_FEED_URL` remains blank.
- Scheduled runs skip Job Bank safely.

After approval, place only the issued XML feed URL in `JOBBANK_XML_FEED_URL` and enable the source row. Job Bank requires feed recipients to provide a direct link back to Job Bank for each posting, which is why Job Bank listings use `application_mode = 'external'`.

If the approved feed's element names differ from the tolerant default mapper in `src/lib/job-import/providers/jobbank.ts`, update only that provider mapper after reviewing a sample feed.

## Scheduling

`.github/workflows/automatic-job-imports.yml` calls the secure route every two hours at minute 17. Scheduled GitHub workflows run from the default branch, so scheduling starts only after this feature is merged.

Required GitHub repository secrets:

- `JOB_IMPORT_URL`: e.g. `https://redstone.co.ke/api/internal/job-import/run`
- `JOB_IMPORT_SECRET`: the same long random secret configured in the deployed app

The endpoint only accepts POST requests with `Authorization: Bearer <JOB_IMPORT_SECRET>` and compares the secret using a constant-time comparison.

## Runtime secrets

Configure these as server-only deployment secrets; never prefix them with `NEXT_PUBLIC_`:

- `SUPABASE_SERVICE_ROLE_KEY`
- `JOB_IMPORT_SECRET`
- `FOUNDROLE_MCP_ACCESS_TOKEN` or `FOUNDROLE_FEED_URL` / `FOUNDROLE_FEED_TOKEN`
- `JOBBANK_XML_FEED_URL` / `JOBBANK_XML_FEED_TOKEN` after Job Bank approval

## Database migration

Apply:

`supabase/migrations/20260905170000_automatic_external_job_imports.sql`

The migration adds source provenance to `jobs`, import source/run/item audit tables, duplicate indexes, admin read policies, and a database publication trigger. The trigger preserves the existing rule that ordinary Red Stone jobs require an active verified employer. External jobs can bypass that employer relation only when they are explicitly marked as auto-imported, have a source identity/URL and use external application mode.

## SEO behavior

Every automatically published external vacancy receives a stable local `/opportunities/[slug]` page with:

- unique canonical URL and metadata
- factual normalized vacancy description rather than a copied source description
- source/employer/location/salary/freshness facts
- JobPosting structured data with `directApply: false`
- sitemap inclusion
- internal link from `/jobs`
- source attribution and original source link

Expired external vacancies are archived automatically when an explicit application deadline has passed. No deadline is invented when the source does not state one.

## Admin monitoring

Open `/admin/job-imports` to see source status, quality thresholds, recent import runs and the latest publish/update/reject/review/duplicate decisions. The normal `/admin/jobs` screen links to this dashboard.
