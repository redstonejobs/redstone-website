import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const trustRoutes = [
  "/about",
  "/mission-vision",
  "/why-red-stone",
  "/ethical-recruitment",
  "/candidate-protection",
  "/employer-services",
  "/recruitment-process",
  "/compliance",
  "/our-commitment",
  "/safety",
  "/official-channels",
];

const companyPages = readFileSync("src/lib/public/company-pages.ts", "utf8");
const renderer = readFileSync("src/components/public/company-info-page.tsx", "utf8");
const shell = readFileSync("src/components/public/public-shell.tsx", "utf8");
const sitemap = readFileSync("src/app/sitemap.ts", "utf8");

test("company trust centre routes exist and use canonical metadata", () => {
  for (const route of trustRoutes) {
    const pagePath = `src/app/(public)${route}/page.tsx`;

    assert.ok(existsSync(pagePath), `${route} page should exist`);
    assert.match(readFileSync(pagePath, "utf8"), new RegExp(`canonical\\("${route}"\\)`));
    assert.match(sitemap, new RegExp(`"${route}"`));
  }
});

test("company trust centre is discoverable from the public footer", () => {
  for (const label of [
    "Mission & Vision",
    "Candidate Protection",
    "Employer Services",
    "Ethical Recruitment",
    "Official Channels",
    "Accessibility",
  ]) {
    assert.match(shell, new RegExp(label.replace("&", "&")));
  }

  assert.match(shell, /Trust & Safety/);
});

test("company trust centre pages include breadcrumb structured data", () => {
  assert.match(renderer, /BreadcrumbList/);
  assert.match(renderer, /application\/ld\+json/);
  assert.match(renderer, /trustNavigation/);
});

test("company trust centre content avoids unverified proof and guarantee claims", () => {
  for (const forbidden of [
    /100% success/i,
    /government-approved/i,
    /number one/i,
    /licen[cs]e number/i,
    /certified by/i,
    /placement numbers/i,
    /success rates/i,
    /guaranteed visa approval/i,
  ]) {
    assert.doesNotMatch(companyPages, forbidden);
  }
});
