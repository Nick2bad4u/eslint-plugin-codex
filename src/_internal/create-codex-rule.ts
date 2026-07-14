/**
 * @packageDocumentation
 * Shared typed rule creator used by \@typpi/eslint-plugin-codex.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

import { ESLintUtils } from "@typescript-eslint/utils";

import type {
    CodexBaseConfigName,
    CodexConfigReference,
} from "./codex-config-references.js";

import { getRuleCatalogEntryForRuleName } from "./rule-catalog.js";
import { createRuleDocsUrl } from "./rule-docs-url.js";

/** Codex-specific metadata extensions stored in `meta.docs`. */
export type CodexRuleDocs = Readonly<{
    codexConfigNames: readonly CodexBaseConfigName[];
    codexConfigs: CodexConfigReference | readonly CodexConfigReference[];
    description: string;
    frozen: boolean;
    recommended: boolean;
    requiresTypeChecking: boolean;
    ruleId: string;
    ruleNumber: number;
    url: string;
}>;

/** Public runtime rule module shape emitted by this plugin. */
export type CodexRuleModule = Readonly<{
    name: string;
}> &
    TSESLint.RuleModule<string, Readonly<UnknownArray>, CodexRuleDocs>;

type BaseRuleCreator = ReturnType<
    typeof ESLintUtils.RuleCreator<CodexRuleInputDocs>
>;

/** Authored docs metadata accepted by individual rule modules. */
type CodexRuleInputDocs = Readonly<{
    codexConfigs: CodexConfigReference | readonly CodexConfigReference[];
    description: string;
    frozen: boolean;
    recommended: boolean;
    requiresTypeChecking: boolean;
    url: string;
}>;

const createTypedRuleCreator = ESLintUtils.RuleCreator<CodexRuleInputDocs>;

const baseRuleCreator: BaseRuleCreator =
    createTypedRuleCreator(createRuleDocsUrl);

const assertNever = (value: never): never => {
    throw new TypeError(`Unsupported Codex config reference: ${String(value)}`);
};

const getCodexConfigNameFromReference = (
    reference: CodexConfigReference
): CodexBaseConfigName => {
    switch (reference) {
        case "codex.configs.all": {
            return "all";
        }

        case "codex.configs.minimal": {
            return "minimal";
        }

        case "codex.configs.recommended": {
            return "recommended";
        }

        case "codex.configs.strict": {
            return "strict";
        }

        default: {
            return assertNever(reference);
        }
    }
};

/** Normalize preset references into stable preset-name keys. */
const normalizeCodexConfigNames: (
    value: CodexConfigReference | readonly CodexConfigReference[]
) => readonly CodexBaseConfigName[] = (
    value: CodexConfigReference | readonly CodexConfigReference[]
) => {
    const references: readonly CodexConfigReference[] = Array.isArray(value)
        ? value
        : [value];
    const normalizedNames = new Set<CodexBaseConfigName>();

    for (const reference of references) {
        normalizedNames.add(getCodexConfigNameFromReference(reference));
    }

    return [...normalizedNames];
};

/**
 * Shared rule creator that injects canonical docs URLs and stable catalog ids.
 */
export const createCodexRule = <
    Options extends Readonly<UnknownArray>,
    MessageIds extends string,
>(
    ruleDefinition: Parameters<typeof baseRuleCreator<Options, MessageIds>>[0]
): CodexRuleModule => {
    const createdRule = baseRuleCreator(ruleDefinition);
    const catalogEntry = getRuleCatalogEntryForRuleName(ruleDefinition.name);
    const authoredDocs: CodexRuleInputDocs = ruleDefinition.meta.docs;
    const docs: CodexRuleDocs = {
        ...authoredDocs,
        codexConfigNames: normalizeCodexConfigNames(authoredDocs.codexConfigs),
        ruleId: catalogEntry.ruleId,
        ruleNumber: catalogEntry.ruleNumber,
        url: createRuleDocsUrl(ruleDefinition.name),
    };

    return {
        ...createdRule,
        meta: {
            ...createdRule.meta,
            docs,
        },
        name: ruleDefinition.name,
    } satisfies CodexRuleModule;
};
