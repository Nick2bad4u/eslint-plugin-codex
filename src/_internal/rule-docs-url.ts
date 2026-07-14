/**
 * @packageDocumentation
 * Canonical rule documentation URL helpers.
 */

/** Stable docs host/prefix for generated rule docs links. */
const RULE_DOCS_URL_BASE =
    "https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/" as const;

/** Build the canonical documentation URL for one Codex rule. */
export const createRuleDocsUrl = (ruleName: string): string =>
    `${RULE_DOCS_URL_BASE}${ruleName}`;
