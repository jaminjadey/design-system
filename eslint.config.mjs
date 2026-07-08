import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

const sourceFilePatterns = ["**/*.{js,mjs,ts,tsx}"];
const sourceUiFilePatterns = [
  "apps/example/src/**/*.{ts,tsx}",
  "apps/storybook/src/**/*.{ts,tsx}",
  "packages/components/src/**/*.{ts,tsx}"
];

const noHardcodedColors = [
  "error",
  {
    selector: "Literal[value=/#[0-9a-fA-F]{3,8}\\b/u]",
    message: "Use a generated design-token CSS variable instead of a hardcoded colour."
  },
  {
    selector: "TemplateElement[value.raw=/#[0-9a-fA-F]{3,8}\\b/u]",
    message: "Use a generated design-token CSS variable instead of a hardcoded colour."
  },
  {
    selector: "Literal[value=/\\b(?:rgb|rgba|hsl|hsla)\\(/iu]",
    message: "Use a generated design-token CSS variable instead of a hardcoded colour function."
  },
  {
    selector: "TemplateElement[value.raw=/\\b(?:rgb|rgba|hsl|hsla)\\(/iu]",
    message: "Use a generated design-token CSS variable instead of a hardcoded colour function."
  }
];

export default tseslint.config(
  {
    ignores: [
      "**/.turbo/**",
      "**/dist/**",
      "**/node_modules/**",
      "**/storybook-static/**",
      "pnpm-lock.yaml"
    ]
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: "error"
    }
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: sourceFilePatterns,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      "no-undef": "off",
      "no-restricted-syntax": "off",
      "@typescript-eslint/array-type": ["error", { default: "array-simple" }],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { fixStyle: "separate-type-imports", prefer: "type-imports" }
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_"
        }
      ]
    }
  },
  {
    files: ["**/*.tsx"],
    plugins: {
      "jsx-a11y": jsxA11y,
      "react-hooks": reactHooks
    },
    rules: {
      ...jsxA11y.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules
    }
  },
  {
    files: ["apps/example/src/**/*.{ts,tsx}", "apps/storybook/src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@mantine/*"],
              message:
                "Apps must consume the design-system API instead of importing Mantine directly."
            }
          ]
        }
      ]
    }
  },
  {
    files: sourceUiFilePatterns,
    rules: {
      "no-restricted-syntax": noHardcodedColors
    }
  },
  {
    files: ["packages/tokens/src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@demo-ds/*"],
              message: "The token package must not depend on downstream design-system packages."
            }
          ]
        }
      ]
    }
  }
);
