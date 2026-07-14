/**
 * @packageDocumentation
 * Synchronize or validate presets documentation tables from canonical rule metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { format, resolveConfig } from "prettier";

import builtPlugin from "../dist/plugin.js";
import { codexBaseConfigNames } from "../dist/_internal/codex-config-references.js";

const matrixSectionHeading = "## Rule matrix";
const presetRulesSectionHeading = "## Rules in this preset";
const presetsDocsDirectoryPath = "docs/rules/presets";

/**
 * @param {unknown} value
 *
 * @returns {value is Readonly<Record<string, unknown>>}
 */
const isUnknownRecord = (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * @param {unknown} value
 *
 * @returns {readonly Readonly<Record<string, unknown>>[]}
 */
const toConfigArray = (value) => {
    if (Array.isArray(value)) {
        return value.filter(isUnknownRecord);
    }

    return isUnknownRecord(value) ? [value] : [];
};

/** @param {readonly string[]} values - @returns {readonly string[]} */
const sortStrings = (values) =>
    [...values].toSorted((left, right) => left.localeCompare(right));

/** @param {string} configRuleKey - @returns {null | string} */
const toPluginRuleName = (configRuleKey) => {
    if (!configRuleKey.startsWith("codex/")) {
        return null;
    }

    return configRuleKey.slice("codex/".length);
};

/** @param {import("../dist/_internal/codex-config-references.js").CodexBaseConfigName} presetConfigName */
const collectPresetRuleNames = (presetConfigName) => {
    const presetConfig = builtPlugin.configs[presetConfigName];
    const presetLayers = toConfigArray(presetConfig);

    if (presetLayers.length === 0) {
        throw new TypeError(
            `Missing preset config '${presetConfigName}' in built plugin.`
        );
    }

    const names = presetLayers.flatMap((presetLayer) => {
        const rules = presetLayer["rules"];

        if (!isUnknownRecord(rules)) {
            return [];
        }

        return Object.keys(rules)
            .map(toPluginRuleName)
            .filter((name) => typeof name === "string");
    });

    return sortStrings(names);
};

/**
 * @param {Readonly<Record<string, unknown>>} ruleModule - The rule module to
 *   inspect.
 *
 * @returns {"—" | "💡" | "🔧" | "🔧 💡"} A symbol indicating the
 *   autofix/suggestion capability.
 */
const getRuleFixIndicator = (ruleModule) => {
    const meta = ruleModule["meta"];

    if (!isUnknownRecord(meta)) {
        return "—";
    }

    const fixable = meta["fixable"] === "code";
    const hasSuggestions = meta["hasSuggestions"] === true;

    if (fixable && hasSuggestions) {
        return "🔧 💡";
    }

    if (fixable) {
        return "🔧";
    }

    return hasSuggestions ? "💡" : "—";
};

/**
 * @param {string} ruleName - The rule's unprefixed name.
 *
 * @returns {Readonly<Record<string, unknown>>} The rule module object from the
 *   built plugin.
 */
const getRuleModuleByName = (ruleName) => {
    const candidate = builtPlugin.rules[ruleName];

    if (!isUnknownRecord(candidate)) {
        throw new TypeError(`Rule '${ruleName}' is missing from built plugin.`);
    }

    return candidate;
};

/** @param {string} ruleName - @returns {string} */
const toPresetRuleRow = (ruleName) => {
    const ruleModule = getRuleModuleByName(ruleName);
    const meta = ruleModule["meta"];
    const docs = isUnknownRecord(meta) ? meta["docs"] : undefined;
    const docsUrl = isUnknownRecord(docs) ? docs["url"] : undefined;

    if (typeof docsUrl !== "string" || docsUrl.trim().length === 0) {
        throw new TypeError(`Rule '${ruleName}' is missing meta.docs.url.`);
    }

    return `| [\`${ruleName}\`](${docsUrl}) | ${getRuleFixIndicator(ruleModule)} |`;
};

/** @param {readonly string[]} ruleNames - @returns {string} */
const createPresetRulesTable = (ruleNames) => {
    if (ruleNames.length === 0) {
        return [
            "| Rule | Fix |",
            "| --- | :-: |",
            "| — | — |",
        ].join("\n");
    }

    return [
        "| Rule | Fix |",
        "| --- | :-: |",
        ...ruleNames.map(toPresetRuleRow),
    ].join("\n");
};

/** @returns {readonly string[]} */
const createFixLegendLines = () => [
    "- `Fix` legend:",
    "  - `🔧` = autofixable",
    "  - `💡` = suggestions available",
    "  - `—` = report only",
];

/** @param {import("../dist/_internal/codex-config-references.js").CodexBaseConfigName} presetConfigName */
const generatePresetRulesSection = (presetConfigName) => {
    const presetRuleNames = collectPresetRuleNames(presetConfigName);

    return [
        presetRulesSectionHeading,
        "",
        ...createFixLegendLines(),
        "",
        createPresetRulesTable(presetRuleNames),
        "",
    ].join("\n");
};

/**
 * @param {string} markdown - @returns {{ headingOffset: number;
 *   sectionEndOffset: number }}
 */
const findMatrixSectionBounds = (markdown) => {
    const headingOffset = markdown.indexOf(matrixSectionHeading);

    if (headingOffset < 0) {
        throw new Error(
            "docs/rules/presets/index.md is missing the `## Rule matrix` section heading."
        );
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        headingOffset + matrixSectionHeading.length
    );

    return {
        headingOffset,
        sectionEndOffset:
            nextHeadingOffset < 0 ? markdown.length : nextHeadingOffset + 1,
    };
};

/** @param {string} markdown - @returns {string} */
const normalizeMarkdownTableSpacing = (markdown) =>
    markdown
        .replaceAll("\r\n", "\n")
        .split("\n")
        .map((line) => {
            const trimmedLine = line.trimEnd();

            if (!/^\|.*\|$/v.test(trimmedLine)) {
                return trimmedLine;
            }

            const cells = trimmedLine
                .split("|")
                .slice(1, -1)
                .map((cell) => cell.trim());

            return `| ${cells.join(" | ")} |`;
        })
        .join("\n")
        .trimEnd();

/** @param {string} text - @returns {string} */
const normalizeLineEndings = (text) => text.replaceAll("\r\n", "\n");

/**
 * @param {string} templateText
 * @param {string} outputText
 *
 * @returns {string}
 */
const restorePreferredLineEndings = (templateText, outputText) => {
    const normalizedOutputText = normalizeLineEndings(outputText);

    return templateText.includes("\r\n")
        ? normalizedOutputText.replaceAll("\n", "\r\n")
        : normalizedOutputText;
};

/**
 * @param {Readonly<Record<string, Readonly<Record<string, unknown>>>>} [rules]
 *
 * @returns {string}
 */
export const generatePresetsRulesMatrixSectionFromRules = (
    rules = /** @type {Readonly<Record<string, Readonly<Record<string, unknown>>>>} */ (
        /** @type {unknown} */ (builtPlugin.rules)
    )
) => {
    const orderedRuleNames = Object.keys(rules).toSorted((left, right) =>
        left.localeCompare(right)
    );
    const headerRow = ["Rule", ...codexBaseConfigNames].join(" | ");
    const separatorRow = ["---", ...codexBaseConfigNames.map(() => ":-:")].join(
        " | "
    );

    const matrixRows = orderedRuleNames.map((ruleName) => {
        const ruleModule = rules[ruleName];
        const meta = isUnknownRecord(ruleModule)
            ? ruleModule["meta"]
            : undefined;
        const docs = isUnknownRecord(meta) ? meta["docs"] : undefined;
        const docsUrl = isUnknownRecord(docs) ? docs["url"] : undefined;
        const configNames =
            isUnknownRecord(docs) && Array.isArray(docs["codexConfigNames"])
                ? docs["codexConfigNames"]
                : [];
        const configNameSet = new Set(configNames);

        const cells = [
            typeof docsUrl === "string"
                ? `[\`${ruleName}\`](${docsUrl})`
                : `\`${ruleName}\``,
            ...codexBaseConfigNames.map((configName) =>
                configNameSet.has(configName) ? "✅" : "—"
            ),
        ];

        return `| ${cells.join(" | ")} |`;
    });

    return [
        matrixSectionHeading,
        "",
        `| ${headerRow} |`,
        `| ${separatorRow} |`,
        ...matrixRows,
        "",
    ].join("\n");
};

/** @param {Readonly<{ writeChanges?: boolean }>} [options] */
export const syncPresetsRulesMatrix = async (options = {}) => {
    const presetsIndexPath = resolve(
        process.cwd(),
        presetsDocsDirectoryPath,
        "index.md"
    );
    const currentIndexMarkdown = await readFile(presetsIndexPath, "utf8");
    const generatedMatrixSection = await format(
        generatePresetsRulesMatrixSectionFromRules(),
        {
            ...(await resolveConfig(presetsIndexPath)),
            filepath: presetsIndexPath,
        }
    );
    const { headingOffset, sectionEndOffset } =
        findMatrixSectionBounds(currentIndexMarkdown);
    const nextIndexMarkdown =
        currentIndexMarkdown.slice(0, headingOffset) +
        generatedMatrixSection +
        currentIndexMarkdown.slice(sectionEndOffset);

    let changed =
        normalizeMarkdownTableSpacing(
            currentIndexMarkdown.slice(headingOffset, sectionEndOffset)
        ) !== normalizeMarkdownTableSpacing(generatedMatrixSection);

    if (changed && options.writeChanges === true) {
        await writeFile(
            presetsIndexPath,
            restorePreferredLineEndings(
                currentIndexMarkdown,
                nextIndexMarkdown
            ),
            "utf8"
        );
    }

    for (const presetConfigName of codexBaseConfigNames) {
        const presetDocPath = resolve(
            process.cwd(),
            presetsDocsDirectoryPath,
            `${presetConfigName}.md`
        );
        const currentPresetMarkdown = await readFile(presetDocPath, "utf8");
        const headingOffset = currentPresetMarkdown.indexOf(
            presetRulesSectionHeading
        );

        if (headingOffset < 0) {
            throw new Error(
                `${presetDocPath} is missing the '${presetRulesSectionHeading}' heading.`
            );
        }

        const nextHeadingOffset = currentPresetMarkdown.indexOf(
            "\n## ",
            headingOffset + presetRulesSectionHeading.length
        );
        const sectionEndOffset =
            nextHeadingOffset < 0
                ? currentPresetMarkdown.length
                : nextHeadingOffset + 1;
        const generatedPresetSection = await format(
            generatePresetRulesSection(presetConfigName),
            {
                ...(await resolveConfig(presetDocPath)),
                filepath: presetDocPath,
            }
        );
        const nextPresetMarkdown =
            currentPresetMarkdown.slice(0, headingOffset) +
            generatedPresetSection +
            currentPresetMarkdown.slice(sectionEndOffset);
        const presetChanged =
            normalizeMarkdownTableSpacing(
                currentPresetMarkdown.slice(headingOffset, sectionEndOffset)
            ) !== normalizeMarkdownTableSpacing(generatedPresetSection);

        changed ||= presetChanged;

        if (presetChanged && options.writeChanges === true) {
            await writeFile(
                presetDocPath,
                restorePreferredLineEndings(
                    currentPresetMarkdown,
                    nextPresetMarkdown
                ),
                "utf8"
            );
        }
    }

    return {
        changed,
        markdown: nextIndexMarkdown,
    };
};

const shouldWriteChanges = process.argv.includes("--write");
const shouldCheckChanges = process.argv.includes("--check");

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
    const result = await syncPresetsRulesMatrix({
        writeChanges: shouldWriteChanges,
    });

    if (shouldCheckChanges && result.changed) {
        throw new Error(
            "Preset rule documentation is stale. Run `npm run sync:presets-rules-matrix:write`."
        );
    }
}
