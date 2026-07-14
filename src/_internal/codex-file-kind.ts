/**
 * @packageDocumentation
 * Path classification helpers for Codex customization files.
 */
import path from "node:path";

import { pathExists } from "./file-system.js";

/** Normalize a path to an absolute slash-separated representation. */
const normalizeFilePath = (filePath: string): string =>
    path.resolve(filePath).replaceAll("\\", "/");

/** Check whether a path is an AGENTS instruction file. */
export const isAgentsFilePath = (filePath: string): boolean => {
    const basename = path.posix.basename(normalizeFilePath(filePath));

    return basename === "AGENTS.md" || basename === "AGENTS.override.md";
};

/** Check whether a path is a Codex custom-agent TOML file. */
export const isCustomAgentFilePath = (filePath: string): boolean => {
    const normalized = normalizeFilePath(filePath);

    return (
        normalized.includes("/.codex/agents/") && normalized.endsWith(".toml")
    );
};

/** Check whether a Markdown file is inside a recognized skill directory. */
export const isSkillMarkdownFilePath = (filePath: string): boolean => {
    const normalized = normalizeFilePath(filePath);

    return (
        normalized.endsWith(".md") &&
        (normalized.includes("/.agents/skills/") ||
            normalized.includes("/.codex/skills/") ||
            normalized.includes("/etc/codex/skills/") ||
            normalized.includes("/skills/"))
    );
};

/** Check whether a path points to a canonical skill definition. */
export const isSkillFilePath = (filePath: string): boolean =>
    isSkillMarkdownFilePath(filePath) &&
    path.posix.basename(normalizeFilePath(filePath)) === "SKILL.md";

/** Check whether a path points to a deprecated Codex custom prompt. */
export const isLegacyPromptFilePath = (filePath: string): boolean => {
    const normalized = normalizeFilePath(filePath);

    return (
        normalized.includes("/.codex/prompts/") && normalized.endsWith(".md")
    );
};

/** Check whether a path points to a Codex hooks.json layer. */
export const isHooksJsonFilePath = (filePath: string): boolean =>
    normalizeFilePath(filePath).endsWith("/.codex/hooks.json") ||
    normalizeFilePath(filePath).endsWith("/hooks/hooks.json");

/** Check whether a path points to a project Codex config layer. */
export const isProjectConfigFilePath = (filePath: string): boolean =>
    normalizeFilePath(filePath).endsWith("/.codex/config.toml");

/** Check whether a path points to any user, project, or profile Codex config. */
export const isCodexConfigFilePath = (filePath: string): boolean => {
    const normalized = normalizeFilePath(filePath);
    const basename = path.posix.basename(normalized);

    return (
        normalized.includes("/.codex/") &&
        !normalized.includes("/.codex/agents/") &&
        (basename === "config.toml" || basename.endsWith(".config.toml"))
    );
};

/** Check whether a TOML file is a Codex config or custom-agent layer. */
export const isCodexTomlFilePath = (filePath: string): boolean =>
    isCodexConfigFilePath(filePath) || isCustomAgentFilePath(filePath);

/** Discover the nearest repository root for a linted file. */
export const findRepositoryRoot = (filePath: string): string => {
    const absoluteFilePath = path.resolve(filePath);
    let currentDirectory = path.dirname(absoluteFilePath);

    while (true) {
        if (
            pathExists(path.join(currentDirectory, ".git")) ||
            pathExists(path.join(currentDirectory, "package.json")) ||
            pathExists(path.join(currentDirectory, "eslint.config.mjs"))
        ) {
            return currentDirectory;
        }

        const parentDirectory = path.dirname(currentDirectory);

        if (parentDirectory === currentDirectory) {
            return path.dirname(absoluteFilePath);
        }

        currentDirectory = parentDirectory;
    }
};
