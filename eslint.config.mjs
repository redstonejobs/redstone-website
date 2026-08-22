import { defineConfig, globalIgnores } from "eslint/config";
import next from "eslint-config-next";
import nextPlugin from "@next/eslint-plugin-next";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...next,
  {
    name: "next/core-web-vitals-local",
    rules: nextPlugin.configs["core-web-vitals"].rules,
  },
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
