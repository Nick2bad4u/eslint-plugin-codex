/**
 * @packageDocumentation
 * Codex AGENTS.md discovery and instruction-chain helpers.
 */
import path from "node:path";
import { stringSplit } from "ts-extras";

import {
    normalizeAbsolutePath,
    pathExists,
    readUtf8File,
} from "./file-system.js";

const DEFAULT_INSTRUCTION_FILENAMES = [
    "AGENTS.md",
    "AGENTS.override.md",
] as const;

const isSamePath = (left: string, right: string): boolean =>
    normalizeAbsolutePath(left).toLowerCase() ===
    normalizeAbsolutePath(right).toLowerCase();

const getDirectoriesFromRoot = (
    repositoryRoot: string,
    targetDirectory: string
): readonly string[] => {
    const relativeDirectory = path.relative(repositoryRoot, targetDirectory);

    if (
        relativeDirectory.startsWith("..") ||
        path.isAbsolute(relativeDirectory)
    ) {
        return [targetDirectory];
    }

    const segments = stringSplit(relativeDirectory, path.sep).filter(
        (segment) => segment.length > 0
    );
    const directories = [repositoryRoot];
    let currentDirectory = repositoryRoot;

    for (const segment of segments) {
        currentDirectory = path.join(currentDirectory, segment);
        directories.push(currentDirectory);
    }

    return directories;
};

const readCandidateText = (
    candidatePath: string,
    currentFilePath: string,
    currentSourceText: string
): string =>
    isSamePath(candidatePath, currentFilePath)
        ? currentSourceText
        : readUtf8File(candidatePath);

/** One active instruction file and its cumulative chain byte count. */
export type ActiveInstructionFile = Readonly<{
    cumulativeBytes: number;
    filePath: string;
}>;

/** Build the active Codex project instruction chain through a target file. */
export const getActiveInstructionChain = (
    repositoryRoot: string,
    currentFilePath: string,
    currentSourceText: string,
    fallbackFilenames: readonly string[]
): readonly ActiveInstructionFile[] => {
    const safeFallbackFilenames = fallbackFilenames.filter(
        (filename) =>
            filename.length > 0 &&
            path.basename(filename) === filename &&
            filename !== "." &&
            filename !== ".."
    );
    const filenames = [
        ...DEFAULT_INSTRUCTION_FILENAMES,
        ...safeFallbackFilenames,
    ];
    const directories = getDirectoriesFromRoot(
        repositoryRoot,
        path.dirname(currentFilePath)
    );
    const activeFiles: ActiveInstructionFile[] = [];
    let cumulativeBytes = 0;

    for (const directory of directories) {
        for (const filename of filenames) {
            const candidatePath = path.join(directory, filename);

            if (
                !isSamePath(candidatePath, currentFilePath) &&
                !pathExists(candidatePath)
            ) {
                continue;
            }

            const text = readCandidateText(
                candidatePath,
                currentFilePath,
                currentSourceText
            );

            if (text.trim().length === 0) {
                continue;
            }

            cumulativeBytes += Buffer.byteLength(text, "utf8");
            activeFiles.push({
                cumulativeBytes,
                filePath: candidatePath,
            });
            break;
        }
    }

    return activeFiles;
};

/** Determine whether an instruction-chain entry is the current lint target. */
export const isCurrentInstructionFile = (
    entry: ActiveInstructionFile,
    currentFilePath: string
): boolean => isSamePath(entry.filePath, currentFilePath);
