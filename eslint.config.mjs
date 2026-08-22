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
]);

export default eslintConfig;
