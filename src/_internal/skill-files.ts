/**
 * @packageDocumentation
 * Shared path helpers for Agent Skills.
 */
import path from "node:path";

import type { FrontmatterDocument } from "./frontmatter.js";

import { normalizeAbsolutePath } from "./file-system.js";
import { hasFrontmatterField } from "./frontmatter.js";

const SKILL_LOCATION_PATTERNS = [
    /\/.agents\/skills\/[^\/]+\/SKILL\.md$/v,
    /\/etc\/codex\/skills\/[^\/]+\/SKILL\.md$/v,
    /\/skills\/[^\/]+\/SKILL\.md$/v,
] as const;

/** Determine whether a file is in a Codex-supported skill location. */
export const isValidSkillDefinitionLocation = (filePath: string): boolean => {
    const normalized = normalizeAbsolutePath(filePath);

    return SKILL_LOCATION_PATTERNS.some((pattern) => pattern.test(normalized));
};

/** Determine whether Markdown looks like a misplaced skill definition. */
export const looksLikeSkillDefinitionDocument = (
    frontmatter: FrontmatterDocument | null
): boolean =>
    frontmatter !== null &&
    (hasFrontmatterField(frontmatter, "name") ||
        hasFrontmatterField(frontmatter, "description") ||
        hasFrontmatterField(frontmatter, "license") ||
        hasFrontmatterField(frontmatter, "compatibility"));

/** Get the basename for a skill-related Markdown file. */
export const getSkillFileBasename = (filePath: string): string =>
    path.basename(filePath);
