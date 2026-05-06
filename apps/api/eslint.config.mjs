import { baseConfig } from "../../packages/eslint-config/base.mjs";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**"],
  },
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // NestJS DI relies on imports being values at runtime (constructor
      // tokens, ValidationPipe metadata for DTOs). The default
      // `consistent-type-imports` autofixer converts these to `import type`
      // and silently breaks the app. Disable it for the API package.
      "@typescript-eslint/consistent-type-imports": "off",
    },
  }
);
