/**
 * Repository-specific configuration for Knip dependency analysis.
 *
 * @packageDocumentation
 */
import type { KnipConfig } from "knip";

/**
 * Knip configuration that scopes entry points and dependency heuristics to the
 * repository layout.
 */
const knipConfig: KnipConfig = {
    $schema: "https://unpkg.com/knip@6/schema.json",
    ignoreBinaries: [
        "actionlint",
        "gitleaks",
        "git-cz",
        "lychee",
        "open-cli",
        // Knip treats the config path passed to `-c` as a binary name.
        "knip.config.ts",
    ],
    ignoreDependencies: [
        "@docusaurus/docusaurus-plugin-theme-live-codeblock",
        "@docusaurus/theme-live-codeblock",
        "@easyops-cn/docusaurus-search-local",
        "@easyops-cn/docusaurus-theme-docusaurus-search-local",
        "@stryker-ignorer/console-all",
        "git-cliff",
        "gitcliff-config-nick2bad4u",
        "gitleaks-config-nick2bad4u",
        "lychee-config-nick2bad4u",
        "ncu-config-nick2bad4u",
        "secretlint-config-nick2bad4u",
        "stylelint.*",
        "postcss.*",
        "tsdoc-config-nick2bad4u",
        "typed-css-modules",
        "typedoc-config-nick2bad4u",
        "yamllint-config-nick2bad4u",
    ],
    ignoreExportsUsedInFile: {
        interface: true,
        type: true,
    },
    rules: {
        binaries: "error",
        dependencies: "error",
        devDependencies: "error",
        duplicates: "error",
        enumMembers: "warn",
        exports: "warn",
        files: "error",
        namespaceMembers: "warn",
        nsExports: "warn",
        nsTypes: "warn",
        optionalPeerDependencies: "error",
        types: "warn",
        unlisted: "error",
        unresolved: "error",
    },
    workspaces: {
        ".": {
            entry: [
                "src/plugin.ts",
                "scripts/*.mjs",
                "*.config.{ts,mjs}",
                "test/**/*.test.ts",
            ],
            project: [
                "src/**/*.ts",
                "scripts/**/*.{js,mjs}",
                "test/**/*.ts",
                "*.{js,mjs,ts}",
            ],
        },
        "docs/docusaurus": {
            entry: ["sidebars.*.ts", "src/pages/**/*.{ts,tsx}"],
            project: ["src/**/*.{ts,tsx}", "*.ts"],
        },
    },
};

export default knipConfig;
