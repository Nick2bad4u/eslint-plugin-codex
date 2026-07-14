import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars = {
    rules: [
        "overview",
        "getting-started",
        {
            collapsed: false,
            items: [
                "presets/index",
                "presets/minimal",
                "presets/recommended",
                "presets/strict",
                "presets/all",
            ],
            label: "Presets",
            type: "category",
        },
        {
            collapsed: false,
            items: [
                "max-agents-instruction-chain-bytes",
                "no-empty-agents-md",
                "no-deprecated-custom-prompts",
            ],
            label: "Instructions and prompts",
            type: "category",
        },
        {
            collapsed: false,
            items: [
                "no-duplicate-skill-names",
                "no-empty-skill-body",
                "require-existing-relative-skill-links",
                "require-relative-skill-links",
                "require-skill-frontmatter",
                "require-skill-location",
                "require-skill-md-filename",
                "require-skill-name-match-directory",
                "require-valid-skill-compatibility",
                "require-valid-skill-description",
                "require-valid-skill-directory-name",
                "require-valid-skill-license",
                "require-valid-skill-name",
            ],
            label: "Agent Skills",
            type: "category",
        },
        {
            collapsed: false,
            items: [
                "require-custom-agent-fields",
                "require-valid-agent-nickname-candidates",
            ],
            label: "Custom agents",
            type: "category",
        },
        {
            collapsed: false,
            items: [
                "no-deprecated-config-features",
                "no-full-access-without-approval",
                "no-ignored-project-config-keys",
                "no-legacy-profile-config",
                "no-mixed-permission-models",
            ],
            label: "Configuration and permissions",
            type: "category",
        },
        {
            collapsed: false,
            items: [
                "no-conflicting-mcp-tool-lists",
                "prefer-environment-mcp-credentials",
                "require-valid-mcp-approval-mode",
                "require-valid-mcp-transport",
            ],
            label: "MCP servers",
            type: "category",
        },
        {
            collapsed: false,
            items: [
                "no-ignored-hook-matcher",
                "no-mixed-hook-representations",
                "no-unsupported-hook-handler",
                "require-valid-hook-events",
                "require-valid-hook-structure",
            ],
            label: "Lifecycle hooks",
            type: "category",
        },
    ],
} satisfies SidebarsConfig;

export default sidebars;
