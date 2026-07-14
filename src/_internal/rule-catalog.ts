import type { ArrayValues } from "type-fest";

/**
 * @packageDocumentation
 * Stable catalog identifiers for eslint-plugin-codex rules.
 */
import { assertDefined, setHas } from "ts-extras";

/** Stable global ordering used for public R001-style identifiers. */
export const orderedRuleNames = [
    "max-agents-instruction-chain-bytes",
    "no-conflicting-mcp-tool-lists",
    "no-deprecated-config-features",
    "no-deprecated-custom-prompts",
    "no-duplicate-skill-names",
    "no-empty-agents-md",
    "no-empty-skill-body",
    "no-full-access-without-approval",
    "no-ignored-hook-matcher",
    "no-ignored-project-config-keys",
    "no-legacy-profile-config",
    "no-mixed-hook-representations",
    "no-mixed-permission-models",
    "no-unsupported-hook-handler",
    "prefer-environment-mcp-credentials",
    "require-custom-agent-fields",
    "require-existing-relative-skill-links",
    "require-relative-skill-links",
    "require-skill-frontmatter",
    "require-skill-location",
    "require-skill-md-filename",
    "require-skill-name-match-directory",
    "require-valid-agent-nickname-candidates",
    "require-valid-hook-events",
    "require-valid-hook-structure",
    "require-valid-mcp-approval-mode",
    "require-valid-mcp-transport",
    "require-valid-skill-compatibility",
    "require-valid-skill-description",
    "require-valid-skill-directory-name",
    "require-valid-skill-license",
    "require-valid-skill-name",
] as const;

/** Catalog metadata for one rule. */
export type CodexRuleCatalogEntry = Readonly<{
    ruleId: CodexRuleCatalogId;
    ruleName: CodexRuleNamePattern;
    ruleNumber: number;
}>;

/** Stable machine-friendly rule identifier. */
export type CodexRuleCatalogId = `R${string}`;

/** Unqualified rule-name union derived from the stable catalog. */
export type CodexRuleNamePattern = ArrayValues<typeof orderedRuleNames>;

const toRuleCatalogId = (ruleNumber: number): CodexRuleCatalogId =>
    `R${String(ruleNumber).padStart(3, "0")}`;

/** Canonical catalog entries in stable display order. */
const codexRuleCatalogEntries: readonly CodexRuleCatalogEntry[] =
    orderedRuleNames.map((ruleName, index) => {
        const ruleNumber = index + 1;

        return {
            ruleId: toRuleCatalogId(ruleNumber),
            ruleName,
            ruleNumber,
        };
    });

const catalogByRuleName = new Map(
    codexRuleCatalogEntries.map((entry) => [entry.ruleName, entry])
);
const ruleNameSet: ReadonlySet<string> = new Set(orderedRuleNames);

const isCodexRuleName = (value: string): value is CodexRuleNamePattern =>
    setHas(ruleNameSet, value);

/** Resolve stable catalog metadata for an authored rule name. */
export const getRuleCatalogEntryForRuleName = (
    ruleName: string
): CodexRuleCatalogEntry => {
    if (!isCodexRuleName(ruleName)) {
        throw new TypeError(`Unknown Codex rule name: ${ruleName}`);
    }

    const entry = catalogByRuleName.get(ruleName);

    assertDefined(entry);

    return entry;
};
