import baseConfig from "./base.mjs";
import { FlatCompat } from "@eslint/eslintrc";
import { fixupConfigRules } from "@eslint/compat";
import path from "path";
import { fileURLToPath } from "url";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

/** @type {import('eslint').Linter.Config[]} */
export const nextConfig = [
  ...baseConfig,
  ...fixupConfigRules(compat.extends("plugin:react/recommended")),
  ...fixupConfigRules(compat.extends("plugin:react-hooks/recommended")),
  ...fixupConfigRules(compat.extends("plugin:@next/next/recommended")),
  ...fixupConfigRules(compat.extends("plugin:@next/next/core-web-vitals")),
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
];

export default nextConfig;
