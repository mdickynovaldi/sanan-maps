import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Override default ignores of eslint-config-next.
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", ".claude/**", "node_modules/**"],
  },
  {
    rules: {
      // False positive di App Router (tidak ada pages/_document.js); link font
      // Material Symbols berada di app/layout.tsx yang berlaku global.
      "@next/next/no-page-custom-font": "off",
    },
  },
];

export default eslintConfig;