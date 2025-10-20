import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import prettier from "eslint-plugin-prettier";
import configPrettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  // Config padrão do Next.js
  ...compat.extends("next/core-web-vitals"),

  // Configuração base + integração com Prettier
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["node_modules/**", ".next/**", "out/**", "build/**"],

    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },

    plugins: {
      react: pluginReact,
      prettier,
    },

    rules: {
      "no-unused-vars": ["error", { varsIgnorePattern: "^[A-Z_]" }],
      "react/react-in-jsx-scope": "off",
      "prettier/prettier": ["error"],
    },

    settings: {
      react: { version: "detect" },
    },
  },

  // Adiciona config do Prettier (desativa conflitos)
  configPrettier,
];

export default config;