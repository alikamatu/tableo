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
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      // Disabled: the autofixer converts service/DTO imports to `import type`,
      // which breaks NestJS DI (constructor tokens) and ValidationPipe metadata.
      // Stylistic-only and not worth the runtime breakage.
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/no-empty-object-type": "warn",
      "no-empty": "warn",
    },
  },
  prettier
);

export default baseConfig;
