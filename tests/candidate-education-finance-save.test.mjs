import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());
const actions = fs.readFileSync(path.join(root, 'src/lib/candidate/actions.ts'), 'utf8');
const page = fs.readFileSync(path.join(root, 'src/app/candidate/applications/[id]/page.tsx'), 'utf8');

function between(source, start, end) {
  const i = source.indexOf(start);
  assert.notEqual(i, -1, `missing start: ${start}`);
  const j = source.indexOf(end, i + start.length);
  assert.notEqual(j, -1, `missing end: ${end}`);
  return source.slice(i, j);
}

test('education save redirects validation/database errors back to education instead of crashing', () => {
  const body = between(actions, 'export async function addCandidateEducation', 'export async function deleteCandidateEducation');
  assert.match(body, /failCandidateSection\([\s\S]*?"education"/);
  assert.match(body, /Please provide an education start date/);
  assert.match(body, /education save failed/);
  assert.doesNotMatch(body, /throw new Error/);
});

test('finance save prevents numeric(14,2) overflow and returns friendly errors', () => {
  const body = between(actions, 'export async function saveCandidateFinancialInformation', 'export async function completeCandidateFinancesSection');
  assert.match(body, /999_999_999_999\.99/);
  assert.match(body, /failCandidateSection\([\s\S]*?"finances"/);
  assert.match(body, /finance save failed/);
  assert.doesNotMatch(body, /throw new Error/);
});

test('finance number inputs enforce the database-safe maximum', () => {
  const matches = page.match(/max="999999999999\.99"/g) ?? [];
  assert.equal(matches.length, 2);
  assert.match(page, /max\?: string/);
  assert.match(page, /max=\{max\}/);
});
