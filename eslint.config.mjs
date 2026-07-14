import nickTwoBadFourU from "eslint-config-nick2bad4u";

import plugin from "./plugin.mjs";

/** @type {import("eslint").Linter.Config[]} */
const config = [
    {
        ignores: [
            "docs/docusaurus/typedoc-plugins/**/*.{js,mjs,cjs,ts,mts,cts}",
            "knip.config.ts",
            "stryker.config.mjs",
            "vitest.stryker.config.ts",
        ],
        name: "Local Tooling Files Outside TypeScript Project Service",
    },
    // The shared config has not shipped a Codex-specific exclusion yet. Its
    // `withoutCopilot` preset is the neutral base used by plugin repositories.
    ...nickTwoBadFourU.configs.withoutCopilot,

    // Local Plugin Config
    // This lets us use the plugin's rules in this repository without needing to publish the plugin first.
    {
        files: ["src/**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}"],
        name: "Local Codex",
        plugins: {
            codex: plugin,
        },
        rules: {
            // @ts-expect-error -- plugin.mjs is typed as generic ESLint.Plugin.
            ...plugin.configs.all[0].rules,
            // @ts-expect-error -- plugin.mjs is typed as generic ESLint.Plugin.
            ...plugin.configs.all[1].rules,
            // @ts-expect-error -- plugin.mjs is typed as generic ESLint.Plugin.
            ...plugin.configs.all[2].rules,
        },
    },
    {
        files: ["eslint.config.mjs"],
        name: "Config File Type-Safety Guardrails",
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-member-access": "off",
        },
    },
    {
        files: ["**/*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}"],
        name: "TypeScript Separate Type Imports",
        rules: {
            "no-duplicate-imports": [
                "error",
                { allowSeparateTypeImports: true },
            ],
        },
    },
    {
        files: [
            "docs/docusaurus/**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}",
            "docs/docusaurus/**/*.css",
            "docs/docusaurus/**/*.json",
            "docs/docusaurus/**/*.md",
        ],
        name: "Docusaurus Documentation Tooling",
        rules: {
            "@typescript-eslint/no-unsafe-type-assertion": "off",
            "@typescript-eslint/switch-exhaustiveness-check": "off",
            "canonical/filename-no-index": "off",
            "json-schema-validator-2/no-invalid": "off",
            "markdown/no-multiple-h1": "off",
            "n/no-process-env": "off",
            "no-plusplus": "off",
            // CSS is validated by the dedicated Stylelint scripts, which retain warning severities.
            "stylelint-2/stylelint": "off",
            "unicorn/filename-case": "off",
            "unicorn/no-non-function-verb-prefix": "off",
            "unicorn/no-top-level-assignment-in-function": "off",
            "unicorn/no-unreadable-new-expression": "off",
            "unicorn/prefer-temporal": "off",
        },
    },
    {
        files: ["src/plugin.ts"],
        name: "Plugin Entrypoint Compatibility Guardrails",
        rules: {
            "@typescript-eslint/no-unsafe-assignment": "off",
            "@typescript-eslint/no-unsafe-type-assertion": "off",
            "import-x/extensions": "off",
        },
    },
    {
        files: ["src/_internal/create-codex-rule.ts"],
        name: "Rule Creator Generic Narrowing",
        rules: {
            "@typescript-eslint/no-unsafe-argument": "off",
        },
    },
    {
        files: ["scripts/**/*.mjs", "docs/docusaurus/typedoc-plugins/**/*.mjs"],
        name: "Tooling Script Documentation Posture",
        rules: {
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-misused-spread": "off",
            "jsdoc/check-tag-names": "off",
            "jsdoc/match-description": "off",
            "jsdoc/no-undefined-types": "off",
            "jsdoc/reject-any-type": "off",
            "jsdoc/require-throws": "off",
        },
    },
    {
        files: [".github/workflows/auto-merge-dependabot-caller.yml"],
        name: "Reusable Dependabot Workflow Caller",
        rules: {
            "github-actions/no-external-job": "off",
        },
    },
    {
        files: ["src/**/*.{ts,mts,cts}"],
        name: "Codex Rule Source Migration Guardrails",
        rules: {
            "import-x/max-dependencies": "off",
            "unicorn/consistent-boolean-name": "off",
            "unicorn/import-style": "off",
            "unicorn/no-break-in-nested-loop": "off",
            "unicorn/no-declarations-before-early-exit": "off",
            "unicorn/prefer-includes-over-repeated-comparisons": "off",
            "unicorn/prefer-minimal-ternary": "off",
        },
    },
    {
        files: ["test/**/*.test.ts"],
        name: "RuleTester Negative Case Suites",
        rules: {
            "test-signal/require-negative-path": "off",
        },
    },
    {
        files: ["test/_internal/vitest-setup.ts"],
        name: "Vitest Setup Sentinel",
        rules: {
            "unicorn/consistent-boolean-name": "off",
        },
    },
    {
        files: ["vite.config.ts"],
        name: "Vitest Config Compatibility",
        rules: {
            "unicorn/prefer-number-coercion": "off",
        },
    },
    // Add repository-specific config entries below as needed.
];

export default config;
