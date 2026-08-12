#!/usr/bin/env node

// @ts-check

import { execFile } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

import { runGitCliff } from "git-cliff";

const cliffConfigPath = "node_modules/gitcliff-config-nick2bad4u/cliff.toml";
const githubRepository = "Nick2bad4u/eslint-plugin-codex";
const releaseTagPattern = /^v\d+\.\d+\.\d+(?:-[\dA-Za-z.\x2D]+)?$/v;
const packageVersionPattern = /^\d+\.\d+\.\d+(?:-[\dA-Za-z.\x2D]+)?$/v;

/**
 * Run Git and return trimmed standard output.
 *
 * @param {readonly string[]} arguments_
 *
 * @returns {Promise<string>}
 */
const runGit = (arguments_) =>
    new Promise((resolvePromise, rejectPromise) => {
        execFile(
            "git",
            [...arguments_],
            { encoding: "utf8" },
            (error, standardOutput) => {
                if (error !== null) {
                    rejectPromise(error);
                    return;
                }

                resolvePromise(standardOutput.trim());
            }
        );
    });

/**
 * Build git-cliff arguments for the repository's normal and release-workflow
 * states.
 *
 * A release workflow creates its version commit and annotated tag locally, but
 * withholds every public ref until npm accepts the package. GitHub metadata
 * enrichment cannot query that intentionally unpushed commit. In that state,
 * assign the release tag to the range ending at the release commit's parent.
 * Every enriched commit then already exists on GitHub, while the notes still
 * carry the intended version.
 *
 * @param {{
 *     additionalArguments: readonly string[];
 *     headParent: string | null;
 *     headSubject: string;
 *     headTags: readonly string[];
 *     previousTag: string | null;
 * }} context
 *
 * @returns {string[]}
 */
export const buildGitCliffArguments = ({
    additionalArguments,
    headParent,
    headSubject,
    headTags,
    previousTag,
}) => {
    const baseArguments = [
        "--config",
        cliffConfigPath,
        "--github-repo",
        githubRepository,
    ];
    const [headTag] = headTags;
    const isLocalReleaseCommit =
        headTags.length === 1 &&
        headTag !== undefined &&
        releaseTagPattern.test(headTag) &&
        headSubject === `chore: release ${headTag}`;

    if (!isLocalReleaseCommit) {
        return [
            ...baseArguments,
            "--current",
            ...additionalArguments,
        ];
    }

    if (headParent === null || previousTag === null) {
        throw new Error(
            `Cannot derive the previous release range for ${headTag}.`
        );
    }

    return [
        ...baseArguments,
        "--tag",
        headTag,
        ...additionalArguments,
        "--",
        `${previousTag}..${headParent}`,
    ];
};

/**
 * Resolve the release tag corresponding to a committed package manifest.
 *
 * @param {string} packageJsonContent
 *
 * @returns {string}
 */
export const resolvePackageVersionTag = (packageJsonContent) => {
    /** @type {unknown} */
    const packageJson = JSON.parse(packageJsonContent);

    if (
        typeof packageJson !== "object" ||
        packageJson === null ||
        !("version" in packageJson) ||
        typeof packageJson.version !== "string" ||
        !packageVersionPattern.test(packageJson.version)
    ) {
        throw new TypeError(
            "The release parent package.json must contain an exact version."
        );
    }

    return `v${packageJson.version}`;
};

/**
 * Generate release notes for the current repository state.
 *
 * @param {readonly string[]} additionalArguments
 *
 * @returns {Promise<void>}
 */
const generateReleaseNotes = async (additionalArguments) => {
    const headTagsOutput = await runGit([
        "tag",
        "--points-at",
        "HEAD",
        "--sort=refname",
    ]);
    const headTags =
        headTagsOutput.length === 0 ? [] : headTagsOutput.split("\n");
    const headSubject = await runGit([
        "log",
        "-1",
        "--format=%s",
    ]);
    const [headTag] = headTags;
    const isLocalReleaseCommit =
        headTags.length === 1 &&
        headTag !== undefined &&
        releaseTagPattern.test(headTag) &&
        headSubject === `chore: release ${headTag}`;
    const headParent = isLocalReleaseCommit
        ? await runGit(["rev-parse", "HEAD^"])
        : null;
    const previousTag =
        headParent === null
            ? null
            : resolvePackageVersionTag(
                  await runGit(["show", `${headParent}:package.json`])
              );

    if (previousTag !== null) {
        await runGit([
            "rev-parse",
            "--verify",
            `refs/tags/${previousTag}^{commit}`,
        ]);
    }
    const cliffArguments = buildGitCliffArguments({
        additionalArguments,
        headParent,
        headSubject,
        headTags,
        previousTag,
    });

    await runGitCliff(cliffArguments);
};

const invokedScriptPath = process.argv[1];
const isDirectExecution =
    invokedScriptPath !== undefined &&
    resolve(invokedScriptPath) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
    try {
        await generateReleaseNotes(process.argv.slice(2));
    } catch (error) {
        console.error("Failed to generate release notes:", error);
        process.exitCode = 1;
    }
}
