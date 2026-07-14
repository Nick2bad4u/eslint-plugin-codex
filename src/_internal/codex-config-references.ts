/**
 * @packageDocumentation
 * Shared Codex preset and config reference constants and type guards.
 */

import type { ArrayValues } from "type-fest";

/** Stable base preset names used across docs, README tables, and rule metadata. */
export const codexBaseConfigNames = [
    "all",
    "minimal",
    "recommended",
    "strict",
] as const;

/** Preset variants for shareable configs that already register language plugins. */
export const codexNoLanguagePluginConfigNames = [
    "all-without-language-plugins",
    "minimal-without-language-plugins",
    "recommended-without-language-plugins",
    "strict-without-language-plugins",
] as const;

/** Canonical flat-config preset keys exposed through `plugin.configs`. */
export const codexConfigNames: readonly [
    ...typeof codexBaseConfigNames,
    ...typeof codexNoLanguagePluginConfigNames,
] = [...codexBaseConfigNames, ...codexNoLanguagePluginConfigNames];

/** Canonical base preset key type used by rule metadata and docs matrices. */
export type CodexBaseConfigName = ArrayValues<typeof codexBaseConfigNames>;

/** Metadata contract shared across preset wiring, docs, and README rendering. */
export type CodexConfigMetadata = Readonly<{
    icon: string;
    presetName: `codex:${CodexBaseConfigName}`;
    readmeOrder: number;
    requiresTypeChecking: boolean;
}>;

/** Canonical flat-config preset key type exposed through `plugin.configs`. */
export type CodexConfigName = ArrayValues<typeof codexConfigNames>;

/** Fully-qualified preset reference lookup object shape. */
type CodexConfigReferenceMap = Readonly<{
    "codex.configs.all": "all";
    "codex.configs.minimal": "minimal";
    "codex.configs.recommended": "recommended";
    "codex.configs.strict": "strict";
}>;

/** Canonical metadata for every exported `codex` preset key. */
export const codexConfigMetadataByName: Readonly<
    Record<CodexBaseConfigName, CodexConfigMetadata>
> = {
    all: {
        icon: "🟣",
        presetName: "codex:all",
        readmeOrder: 4,
        requiresTypeChecking: false,
    },
    minimal: {
        icon: "🟢",
        presetName: "codex:minimal",
        readmeOrder: 1,
        requiresTypeChecking: false,
    },
    recommended: {
        icon: "🟡",
        presetName: "codex:recommended",
        readmeOrder: 2,
        requiresTypeChecking: false,
    },
    strict: {
        icon: "🔴",
        presetName: "codex:strict",
        readmeOrder: 3,
        requiresTypeChecking: false,
    },
};

/** Fully-qualified preset reference lookup used by rule docs metadata. */
export const codexConfigReferenceToName: CodexConfigReferenceMap = {
    "codex.configs.all": "all",
    "codex.configs.minimal": "minimal",
    "codex.configs.recommended": "recommended",
    "codex.configs.strict": "strict",
};

/** Fully-qualified preset reference type accepted in docs metadata. */
export type CodexConfigReference = keyof typeof codexConfigReferenceToName;
