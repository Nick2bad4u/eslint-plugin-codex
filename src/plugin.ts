/**
 * @packageDocumentation
 * Public plugin entrypoint for \@typpi/eslint-plugin-codex.
 */
import type { ESLint, Linter } from "eslint";
import type { Except } from "type-fest";

import * as jsonPluginModule from "@eslint/json";
import * as markdownPluginModule from "@eslint/markdown";
import * as tomlParserModule from "toml-eslint-parser";
import { objectEntries, safeCastTo, setHas } from "ts-extras";

import type { CodexRuleDocs } from "./_internal/create-codex-rule.js";

import packageJson from "../package.json" with { type: "json" };
import {
    type CodexBaseConfigName,
    codexConfigMetadataByName,
    type CodexConfigName,
} from "./_internal/codex-config-references.js";
import { codexRules } from "./_internal/rules-registry.js";

const ERROR_SEVERITY = "error" as const;

/** Markdown customization files linted by Codex presets. */
const CODEX_MARKDOWN_FILES = [
    "**/.agents/skills/**/*.md",
    "**/.codex/prompts/*.md",
    "**/AGENTS.md",
    "**/AGENTS.override.md",
    "**/skills/**/*.md",
] as const;

/** TOML configuration and custom-agent files linted by Codex presets. */
const CODEX_TOML_FILES = [
    "**/.codex/*.config.toml",
    "**/.codex/agents/*.toml",
    "**/.codex/config.toml",
] as const;

/** JSON hook files linted by Codex presets. */
const CODEX_JSON_FILES = [
    "**/.codex/hooks.json",
    "**/hooks/hooks.json",
] as const;

/** Flat-config preset layers produced by this plugin. */
export type CodexPresetConfig = CodexPresetLayer[];

/** One flat-config layer produced by this plugin. */
export type CodexPresetLayer = Linter.Config & {
    rules: NonNullable<Linter.Config["rules"]>;
};

/** Fully qualified \@typpi/eslint-plugin-codex rule identifiers. */
export type CodexRuleId = `codex/${CodexRuleName}`;

/** Unqualified rule names supported by \@typpi/eslint-plugin-codex. */
export type CodexRuleName = keyof typeof codexRules;

type CodexConfigsContract = Record<CodexConfigName, CodexPresetConfig>;

type CodexPluginContract = Except<ESLint.Plugin, "configs" | "rules"> & {
    configs: CodexConfigsContract;
    meta: {
        name: string;
        namespace: string;
        version: string;
    };
    processors: NonNullable<ESLint.Plugin["processors"]>;
    rules: NonNullable<ESLint.Plugin["rules"]>;
};

type LanguagePluginRegistrationMode = "external" | "self-contained";

const MARKDOWN_RULE_NAMES: ReadonlySet<CodexRuleName> = new Set([
    "max-agents-instruction-chain-bytes",
    "no-deprecated-custom-prompts",
    "no-duplicate-skill-names",
    "no-empty-agents-md",
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
]);

const SHARED_HOOK_RULE_NAMES: ReadonlySet<CodexRuleName> = new Set([
    "no-ignored-hook-matcher",
    "no-unsupported-hook-handler",
    "require-valid-hook-events",
    "require-valid-hook-structure",
]);

const TOML_RULE_NAMES: ReadonlySet<CodexRuleName> = new Set([
    "no-conflicting-mcp-tool-lists",
    "no-deprecated-config-features",
    "no-full-access-without-approval",
    "no-ignored-project-config-keys",
    "no-legacy-profile-config",
    "no-mixed-hook-representations",
    "no-mixed-permission-models",
    "prefer-environment-mcp-credentials",
    "require-custom-agent-fields",
    "require-valid-agent-nickname-candidates",
    "require-valid-mcp-approval-mode",
    "require-valid-mcp-transport",
    ...SHARED_HOOK_RULE_NAMES,
]);

const getPackageVersion = (pkg: unknown): string => {
    if (typeof pkg !== "object" || pkg === null) {
        return "0.0.0";
    }

    const version = Reflect.get(pkg, "version");

    return typeof version === "string" ? version : "0.0.0";
};

const eslintRules: NonNullable<ESLint.Plugin["rules"]> & typeof codexRules =
    codexRules as NonNullable<ESLint.Plugin["rules"]> & typeof codexRules;
const markdownPlugin: ESLint.Plugin = markdownPluginModule.default;
const jsonPlugin: ESLint.Plugin = jsonPluginModule.default;

const codexRuleEntries = safeCastTo<
    readonly (readonly [CodexRuleName, (typeof codexRules)[CodexRuleName]])[]
>(
    objectEntries(codexRules).toSorted(([left], [right]) =>
        left.localeCompare(right)
    )
);

const createEmptyPresetRuleMap = (): Record<
    CodexBaseConfigName,
    CodexRuleName[]
> => ({
    all: [],
    minimal: [],
    recommended: [],
    strict: [],
});

const derivePresetRuleNamesByConfig = (): Readonly<
    Record<CodexBaseConfigName, readonly CodexRuleName[]>
> => {
    const presetRuleMap = createEmptyPresetRuleMap();

    for (const [ruleName, ruleModule] of codexRuleEntries) {
        const docs = ruleModule.meta.docs as CodexRuleDocs;

        for (const configName of docs.codexConfigNames) {
            presetRuleMap[configName].push(ruleName);
        }
    }

    return {
        all: [...new Set(presetRuleMap.all)],
        minimal: [...new Set(presetRuleMap.minimal)],
        recommended: [...new Set(presetRuleMap.recommended)],
        strict: [...new Set(presetRuleMap.strict)],
    };
};

const errorRulesFor = (
    ruleNames: readonly CodexRuleName[]
): CodexPresetLayer["rules"] => {
    const rules: CodexPresetLayer["rules"] = {};

    for (const ruleName of ruleNames) {
        rules[`codex/${ruleName}`] = ERROR_SEVERITY;
    }

    return rules;
};

const filterRuleNames = (
    ruleNames: readonly CodexRuleName[],
    allowedRuleNames: ReadonlySet<CodexRuleName>
): readonly CodexRuleName[] =>
    ruleNames.filter((ruleName) => setHas(allowedRuleNames, ruleName));

const presetRuleNamesByConfig = derivePresetRuleNamesByConfig();

const createMarkdownPluginMap = (
    plugin: Readonly<CodexPluginContract>,
    registrationMode: LanguagePluginRegistrationMode
): NonNullable<CodexPresetLayer["plugins"]> =>
    registrationMode === "self-contained"
        ? {
              codex: plugin,
              markdown: markdownPlugin,
          }
        : {
              codex: plugin,
          };

const createJsonPluginMap = (
    plugin: Readonly<CodexPluginContract>,
    registrationMode: LanguagePluginRegistrationMode
): NonNullable<CodexPresetLayer["plugins"]> =>
    registrationMode === "self-contained"
        ? {
              codex: plugin,
              json: jsonPlugin,
          }
        : {
              codex: plugin,
          };

const createPresetConfig = (
    configName: CodexBaseConfigName,
    plugin: Readonly<CodexPluginContract>,
    registrationMode: LanguagePluginRegistrationMode
): CodexPresetConfig => {
    const basePresetName = codexConfigMetadataByName[configName].presetName;
    const presetName =
        registrationMode === "self-contained"
            ? basePresetName
            : `${basePresetName}-without-language-plugins`;
    const presetRuleNames = presetRuleNamesByConfig[configName];
    const markdownRuleNames = filterRuleNames(
        presetRuleNames,
        MARKDOWN_RULE_NAMES
    );
    const tomlRuleNames = filterRuleNames(presetRuleNames, TOML_RULE_NAMES);
    const jsonRuleNames = filterRuleNames(
        presetRuleNames,
        SHARED_HOOK_RULE_NAMES
    );

    return [
        {
            files: [...CODEX_MARKDOWN_FILES],
            language: "markdown/gfm",
            name: `${presetName}:markdown`,
            plugins: createMarkdownPluginMap(plugin, registrationMode),
            rules: errorRulesFor(markdownRuleNames),
        },
        {
            files: [...CODEX_TOML_FILES],
            languageOptions: {
                parser: tomlParserModule,
                parserOptions: {
                    tomlVersion: "1.0.0",
                },
            },
            name: `${presetName}:toml`,
            plugins: {
                codex: plugin,
            },
            rules: errorRulesFor(tomlRuleNames),
        },
        {
            files: [...CODEX_JSON_FILES],
            language: "json/json",
            name: `${presetName}:json`,
            plugins: createJsonPluginMap(plugin, registrationMode),
            rules: errorRulesFor(jsonRuleNames),
        },
    ];
};

/** Public ESLint plugin entrypoint, including layered flat presets. */
const plugin: CodexPluginContract = {
    configs: {} as CodexConfigsContract,
    meta: {
        name: "@typpi/eslint-plugin-codex",
        namespace: "codex",
        version: getPackageVersion(packageJson),
    },
    processors: {},
    rules: eslintRules,
};

const createPreset = (
    name: CodexBaseConfigName,
    mode: LanguagePluginRegistrationMode
): CodexPresetConfig => createPresetConfig(name, plugin, mode);

plugin.configs = {
    all: createPreset("all", "self-contained"),
    "all-without-language-plugins": createPreset("all", "external"),
    minimal: createPreset("minimal", "self-contained"),
    "minimal-without-language-plugins": createPreset("minimal", "external"),
    recommended: createPreset("recommended", "self-contained"),
    "recommended-without-language-plugins": createPreset(
        "recommended",
        "external"
    ),
    strict: createPreset("strict", "self-contained"),
    "strict-without-language-plugins": createPreset("strict", "external"),
};

export default plugin;
