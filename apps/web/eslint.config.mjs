import { nextConfig } from "../../packages/eslint-config/next.mjs";

export default [
  {
    ignores: [".next/**"],
  },
  ...nextConfig,
];
