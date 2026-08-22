# Phase 3 Production Readiness Notes

## Rate Limiting

- Put Cloudflare or an equivalent edge layer in front of `/login`, `/auth/*`, `/admin/*`, and any mutation route.
- Start with stricter limits on authentication and document download endpoints than on normal page views.
- Keep server-side authorization in every server action; edge rules are only a traffic-control layer.

## Storage

- Candidate documents should stay in the private `candidate-documents` bucket.
- Admin document access uses short-lived signed URLs after staff authorization and path validation.
- Do not expose service-role keys to the browser.

## Backups and Recovery

- Enable scheduled Supabase database backups before launch.
- Test restore into a non-production project before public traffic.
- Export and version migration SQL separately from data backups.

## Operations

- Apply migrations manually or through a controlled CI step; do not edit already-applied migrations.
- Review audit logs for staff role changes, application overrides, document reviews, and employer verification changes.
- Keep `.env.local` untracked and use only public Supabase anon values in client code.
