import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260907141000_split_public_job_employer_rls.sql",
  "utf8",
);

test("anonymous public job and employer policies do not depend on staff-only helpers", () => {
  const employerPublic = between(
    migration,
    'create policy "Public can view verified employers"',
    'create policy "Staff can view all employers"',
  );
  const jobsPublic = between(
    migration,
    'create policy "Public can view published jobs"',
    'create policy "Staff can view all jobs"',
  );

  assert.match(employerPublic, /to anon, authenticated/);
  assert.match(employerPublic, /verification_status = 'verified'/);
  assert.match(employerPublic, /is_active = true/);
  assert.doesNotMatch(employerPublic, /is_staff\(/);

  assert.match(jobsPublic, /to anon, authenticated/);
  assert.match(jobsPublic, /status = 'published'/);
  assert.match(jobsPublic, /application_deadline/);
  assert.match(jobsPublic, /e\.verification_status = 'verified'/);
  assert.match(jobsPublic, /e\.is_active = true/);
  assert.doesNotMatch(jobsPublic, /is_staff\(/);
});

test("privileged job and employer visibility remains separate for authenticated roles", () => {
  assert.match(migration, /create policy "Staff can view all employers"[\s\S]*to authenticated[\s\S]*public\.is_staff\(\)/);
  assert.match(migration, /create policy "Staff can view all jobs"[\s\S]*to authenticated[\s\S]*public\.is_staff\(\)/);
  assert.match(migration, /create policy "Employer owners can view own jobs"[\s\S]*e\.owner_user_id = auth\.uid\(\)/);
});

function between(source, start, end) {
  const from = source.indexOf(start);
  assert.notEqual(from, -1, `missing start marker: ${start}`);
  const to = source.indexOf(end, from + start.length);
  assert.notEqual(to, -1, `missing end marker: ${end}`);
  return source.slice(from, to);
}
