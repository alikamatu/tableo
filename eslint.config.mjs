import tseslint from "typescript-eslint";
import { baseConfig } from "./packages/eslint-config/base.mjs";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/public/**",
    ],
  },
  ...baseConfig
);
