-- Keep FoundRole discovery broad enough to refresh active listings while preserving
-- vacancy-specific sponsorship checks in application code.

update public.job_import_sources
set config = jsonb_set(
  coalesce(config, '{}'::jsonb),
  '{posted_days_ago}',
  '30'::jsonb,
  true
),
updated_at = now()
where provider = 'foundrole';
