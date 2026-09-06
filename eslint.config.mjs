import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...next,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    ".open-next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "cloudflare-env.d.ts",
  ]),
  // These long-form policy pages intentionally use natural-language apostrophes in JSX copy.
  // Keep the warning visible without blocking CI; the rule stays strict everywhere else.
  {
    files: [
      "src/app/(public)/complaints/page.tsx",
      "src/app/(public)/data-protection/page.tsx",
      "src/app/(public)/payment-terms/page.tsx",
      "src/app/(public)/refund-cancellation/page.tsx",
    ],
    rules: {
      "react/no-unescaped-entities": "warn",
    },
  },
]);

export default eslintConfig;
