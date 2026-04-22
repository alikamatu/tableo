import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
// Note: eslint-plugin-import doesn't have native flat config yet, skipping for now or using compat
// For now, let's just use the core rules and tseslint

/** @type {import('eslint').Linter.Config[]} */
export const baseConfig = tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
    },
  },
  prettier
);

export default baseConfig;
