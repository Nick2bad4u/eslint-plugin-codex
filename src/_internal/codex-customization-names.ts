/**
 * @packageDocumentation
 * Shared naming helpers for Codex skills.
 */
import path from "node:path";

import type { FrontmatterDocument } from "./frontmatter.js";

import { getFrontmatterScalar } from "./frontmatter.js";

/** Normalize a name for case-insensitive duplicate comparisons. */
export const normalizeNameForComparison = (value: string): string =>
    value.trim().toLowerCase();

const isLowercaseAsciiLetterOrDigit = (character: string): boolean => {
    const codePoint = character.codePointAt(0) ?? 0;

    return (
        (codePoint >= 48 && codePoint <= 57) ||
        (codePoint >= 97 && codePoint <= 122)
    );
};

/** Validate an Agent Skills identifier. */
export const isValidSkillIdentifier = (value: string): boolean => {
    if (
        value.length === 0 ||
        value.length > 64 ||
        value.startsWith("-") ||
        value.endsWith("-") ||
        value.includes("--")
    ) {
        return false;
    }

    for (const character of value) {
        if (character !== "-" && !isLowercaseAsciiLetterOrDigit(character)) {
            return false;
        }
    }

    return true;
};

/** Get the parent directory name for a skill file. */
export const getSkillDirectoryName = (filePath: string): string =>
    path.basename(path.dirname(filePath));

/** Get the declared skill name, falling back to the directory name. */
export const getSkillName = (
    filePath: string,
    frontmatter: FrontmatterDocument | null
): string =>
    frontmatter === null
        ? getSkillDirectoryName(filePath)
        : (getFrontmatterScalar(frontmatter, "name") ??
          getSkillDirectoryName(filePath));
