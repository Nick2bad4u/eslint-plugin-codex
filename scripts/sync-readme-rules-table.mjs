/**
 * @packageDocumentation
 * Synchronize or validate the README rules matrix from canonical rule metadata.
 */
// @ts-check

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { format, resolveConfig } from "prettier";

import builtPlugin from "../dist/plugin.js";
import { generatePresetsRulesMatrixSectionFromRules } from "./sync-presets-rules-matrix.mjs";

const rulesSectionHeading = "## Rules";

/**
 * @param {string} markdown
 *
 * @returns {{ endOffset: number; startOffset: number }}
 */
const getReadmeRulesSectionBounds = (markdown) => {
    const startOffset = markdown.indexOf(rulesSectionHeading);

    if (startOffset < 0) {
        throw new Error("README.md is missing the '## Rules' section heading.");
    }

    const nextHeadingOffset = markdown.indexOf(
        "\n## ",
        startOffset + rulesSectionHeading.length
    );

    return {
        endOffset: nextHeadingOffset < 0 ? markdown.length : nextHeadingOffset,
        startOffset,
    };
};

/**
 * @param {string} markdown
 *
 * @returns {string}
 */
export const normalizeRulesSectionMarkdown = (markdown) =>
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
 * @param {Readonly<Record<string, Readonly<Record<string, unknown>>>>} rules
 *
 * @returns {string}
 */
export const generateReadmeRulesSectionFromRules = (rules) => {
    const matrixSection = generatePresetsRulesMatrixSectionFromRules(rules);
    const matrixWithoutHeading = matrixSection.replace(
        /^## Rule matrix\n\n/v,
        ""
    );

    return [
        "## Rules",
        "",
        matrixWithoutHeading.trimEnd(),
    ].join("\n");
};

/**
 * @param {Readonly<{ writeChanges?: boolean }>} [options]
 *
 * @returns {Promise<{ changed: boolean; markdown: string }>}
 */
export const syncReadmeRulesTable = async (options = {}) => {
    const readmePath = resolve(process.cwd(), "README.md");
    const currentMarkdown = await readFile(readmePath, "utf8");
    const generatedSection = await format(
        generateReadmeRulesSectionFromRules(
            /**
             * @type {Readonly<
             *     Record<string, Readonly<Record<string, unknown>>>
             * >}
             */ (/** @type {unknown} */ (builtPlugin.rules))
        ),
        {
            ...(await resolveConfig(readmePath)),
            filepath: readmePath,
        }
    );
    const { endOffset, startOffset } =
        getReadmeRulesSectionBounds(currentMarkdown);
    const nextMarkdown =
        currentMarkdown.slice(0, startOffset) +
        generatedSection +
        currentMarkdown.slice(endOffset);
    const changed =
        normalizeRulesSectionMarkdown(
            currentMarkdown.slice(startOffset, endOffset)
        ) !== normalizeRulesSectionMarkdown(generatedSection);

    if (changed && options.writeChanges === true) {
        await writeFile(
            readmePath,
            restorePreferredLineEndings(currentMarkdown, nextMarkdown),
            "utf8"
        );
    }

    return {
        changed,
        markdown: nextMarkdown,
    };
};

const shouldWriteChanges = process.argv.includes("--write");
const shouldCheckChanges = process.argv.includes("--check");

if (import.meta.url === new URL(`file://${process.argv[1]}`).href) {
    const result = await syncReadmeRulesTable({
        writeChanges: shouldWriteChanges,
    });

    if (shouldCheckChanges && result.changed) {
        throw new Error(
            "README.md rule table is stale. Run `npm run sync:readme-rules-table:write`."
        );
    }
}
