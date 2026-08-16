/**
 * @packageDocumentation
 * Shared typed rule creator used by `@typpi/eslint-plugin-codex`.
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

/** ESLint language identifiers supported by Codex rule implementations. */
export type CodexRuleLanguage =
    | "js/js"
    | "json/json"
    | "markdown/gfm";

/** Public runtime rule module shape emitted by this plugin. */
export type CodexRuleModule = BaseCodexRuleModule &
    Readonly<{
        meta: BaseCodexRuleModule["meta"] & CodexRuleLanguageMetadata;
        name: string;
    }>;

type BaseCodexRuleModule = TSESLint.RuleModule<
    string,
    Readonly<UnknownArray>,
    CodexRuleDocs
>;

type BaseRuleCreator = ReturnType<
    typeof ESLintUtils.RuleCreator<CodexRuleInputDocs>
>;

type CodexRuleDefinition<
    Options extends Readonly<UnknownArray>,
    MessageIds extends string,
> = Readonly<{
    create: (
        context: Readonly<TSESLint.RuleContext<MessageIds, Options>>,
        optionsWithDefault: Readonly<Options>
    ) => TSESLint.RuleListener;
    /** @deprecated Use meta.defaultOptions instead. */
    defaultOptions?: Readonly<Options>;
    meta: CodexRuleInputMeta<Options, MessageIds>;
    name: string;
}>;

/** Authored docs metadata accepted by individual rule modules. */
type CodexRuleInputDocs = Readonly<{
    codexConfigs: CodexConfigReference | readonly CodexConfigReference[];
    description: string;
    frozen: boolean;
    recommended: boolean;
    requiresTypeChecking: boolean;
    url: string;
}>;

type CodexRuleInputMeta<
    Options extends Readonly<UnknownArray>,
    MessageIds extends string,
> = Readonly<{
    defaultOptions?: Options;
    deprecated?: NonNullable<
        TSESLint.RuleMetaData<
            MessageIds,
            CodexRuleInputDocs,
            Options
        >["deprecated"]
    >;
    docs: CodexRuleInputDocs;
    fixable?: NonNullable<TSESLint.RuleMetaData<MessageIds>["fixable"]>;
    hasSuggestions?: boolean;
    languages: readonly CodexRuleLanguage[];
    messages: Record<MessageIds, string>;
    replacedBy?: readonly string[];
    schema: TSESLint.RuleMetaData<MessageIds>["schema"];
    type: TSESLint.RuleMetaData<MessageIds>["type"];
}>;

type CodexRuleLanguageMetadata = Readonly<{
    languages: readonly CodexRuleLanguage[];
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
    ruleDefinition: CodexRuleDefinition<Options, MessageIds>
): CodexRuleModule => {
    const { languages, ...baseMeta } = ruleDefinition.meta;
    const createdRule = baseRuleCreator({
        ...ruleDefinition,
        meta: baseMeta,
    });
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
            languages,
        },
        name: ruleDefinition.name,
    } satisfies CodexRuleModule;
};
