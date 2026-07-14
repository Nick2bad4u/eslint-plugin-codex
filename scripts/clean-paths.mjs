/** Native cleanup utility for cache/build paths without third-party removers. */
import { glob, rm } from "node:fs/promises";

/** Glob metacharacters used by Node's glob matcher. */
const GLOB_METACHARACTERS = [
    "*",
    "?",
    "[",
    "]",
    "{",
    "}",
];

/**
 * Detect whether a path token contains glob metacharacters.
 *
 * @param {string} value - Path token from CLI input.
 *
 * @returns {boolean} True when the token should be treated as a glob pattern.
 */
const isGlobPattern = (value) =>
    GLOB_METACHARACTERS.some((character) => value.includes(character));

/**
 * Expand supported environment tokens used in package scripts.
 *
 * @param {string} value - Raw path token from CLI input.
 *
 * @returns {string} Expanded path token.
 */
const expandEnvironmentTokens = (value) => {
    const appDataPath = process.env["APPDATA"];

    if (typeof appDataPath !== "string" || appDataPath.length === 0) {
        return value;
    }

    return value
        .replaceAll("%appdata%", appDataPath)
        .replaceAll("%APPDATA%", appDataPath)
        .replaceAll("$APPDATA", appDataPath);
};

/**
 * Resolve CLI path patterns into concrete removable targets.
 *
 * @param {readonly string[]} rawPatterns - CLI path tokens.
 *
 * @returns {Promise<readonly string[]>} Concrete files/directories to remove.
 */
const resolveTargets = async (rawPatterns) => {
    /** @type {Set<string>} */
    const targets = new Set();

    for (const rawPattern of rawPatterns) {
        const expandedPattern = expandEnvironmentTokens(rawPattern).trim();

        if (expandedPattern.length === 0) {
            continue;
        }

        if (!isGlobPattern(expandedPattern)) {
            targets.add(expandedPattern);
            continue;
        }

        for await (const matchedPath of glob(expandedPattern)) {
            targets.add(matchedPath);
        }
    }

    return [...targets];
};

/**
 * Remove all provided file-system targets recursively.
 *
 * @param {readonly string[]} targets - Concrete file-system paths.
 *
 * @returns {Promise<void>} Resolves when all removals complete.
 */
const removeTargets = async (targets) => {
    await Promise.all(
        targets.map(async (targetPath) => {
            await rm(targetPath, { force: true, recursive: true });
        })
    );
};

const patterns = process.argv.slice(2);

if (patterns.length === 0) {
    process.exit(0);
}

await removeTargets(await resolveTargets(patterns));
