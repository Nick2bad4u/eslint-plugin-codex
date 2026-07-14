/**
 * @packageDocumentation
 * Shared filesystem helpers for Codex repository rule implementations.
 */
import * as fs from "node:fs";
import path from "node:path";
import { isDefined, isEmpty } from "ts-extras";

const WINDOWS_ABSOLUTE_PATH_PATTERN = /^[A-Za-z]:(?:\/|\\\\)/v;
const URI_SCHEME_PATTERN = /^[A-Za-z][+\-.0-9A-Za-z]*:/v;

/** Normalize a path to absolute slash-separated form. */
export const normalizeAbsolutePath = (filePath: string): string =>
    path.resolve(filePath).replaceAll("\\", "/");

/** Determine whether an absolute or relative path currently exists on disk. */
export const pathExists = (filePath: string): boolean =>
    // eslint-disable-next-line n/no-sync, security/detect-non-literal-fs-filename -- ESLint rule evaluation is synchronous and requires deterministic local filesystem reads.
    fs.existsSync(filePath);

/** Read a UTF-8 text file for rule evaluation. */
export const readUtf8File = (filePath: string): string =>
    // eslint-disable-next-line n/no-sync, security/detect-non-literal-fs-filename -- ESLint rule evaluation is synchronous and requires deterministic local filesystem reads.
    fs.readFileSync(filePath, "utf8");

/** Remove `#fragment` and `?query` suffixes from a Markdown-style path target. */
const stripPathFragmentAndQuery = (value: string): string => {
    const queryIndex = value.indexOf("?");
    const fragmentIndex = value.indexOf("#");
    const cutIndexCandidates = [queryIndex, fragmentIndex].filter(
        (index) => index >= 0
    );

    if (isEmpty(cutIndexCandidates)) {
        return value;
    }

    return value.slice(0, Math.min(...cutIndexCandidates));
};

/** Determine whether a string is a Windows absolute path such as `C:\repo`. */
const isWindowsAbsolutePath = (value: string): boolean =>
    WINDOWS_ABSOLUTE_PATH_PATTERN.test(value);

/** Determine whether a string starts with a URI-like scheme such as `https:`. */
const hasUriScheme = (value: string): boolean =>
    !isWindowsAbsolutePath(value) && URI_SCHEME_PATTERN.test(value);

/** Determine whether a path token is obviously non-relative for workspace use. */
export const isNonRelativeWorkspacePath = (value: string): boolean => {
    const trimmedValue = value.trim();
    const lowercaseValue = trimmedValue.toLowerCase();

    if (trimmedValue.length === 0 || trimmedValue.startsWith("#")) {
        return false;
    }

    if (
        lowercaseValue.startsWith("/") ||
        lowercaseValue.startsWith("\\") ||
        lowercaseValue.startsWith("~/") ||
        lowercaseValue.startsWith("~\\") ||
        lowercaseValue.startsWith("file:")
    ) {
        return true;
    }

    return isWindowsAbsolutePath(trimmedValue);
};

/** Determine whether a value is a workspace-relative path-like reference. */
export const isRelativeWorkspacePath = (value: string): boolean => {
    const trimmedValue = value.trim();

    return (
        trimmedValue.length > 0 &&
        !trimmedValue.startsWith("#") &&
        !hasUriScheme(trimmedValue) &&
        !isNonRelativeWorkspacePath(trimmedValue)
    );
};

/** Resolve a workspace-relative path from the current file location. */
export const resolveRelativeWorkspacePath = (
    currentFilePath: string,
    relativePath: string
): string =>
    path.resolve(
        path.dirname(currentFilePath),
        stripPathFragmentAndQuery(relativePath)
    );

/** Visit one directory and return discovered child files and subdirectories. */
const collectDirectoryFiles = (
    currentDirectory: string,
    predicate?: (absoluteFilePath: string) => boolean
): Readonly<{
    discoveredFiles: readonly string[];
    pendingDirectories: readonly string[];
}> => {
    const discoveredFiles: string[] = [];
    const pendingDirectories: string[] = [];
    // eslint-disable-next-line n/no-sync, security/detect-non-literal-fs-filename -- ESLint rule evaluation is synchronous and requires deterministic local filesystem reads.
    const directoryEntries = fs.readdirSync(currentDirectory, {
        withFileTypes: true,
    });

    for (const entry of directoryEntries) {
        const absoluteEntryPath = path.join(currentDirectory, entry.name);

        if (entry.isDirectory()) {
            pendingDirectories.push(absoluteEntryPath);
            continue;
        }

        if (!entry.isFile()) {
            continue;
        }

        if (isDefined(predicate) && !predicate(absoluteEntryPath)) {
            continue;
        }

        discoveredFiles.push(absoluteEntryPath);
    }

    return {
        discoveredFiles,
        pendingDirectories,
    };
};

/** Recursively list files under a directory when it exists. */
export const listFilesRecursively = (
    directoryPath: string,
    predicate?: (absoluteFilePath: string) => boolean
): readonly string[] => {
    if (!pathExists(directoryPath)) {
        return [];
    }

    const discoveredFiles: string[] = [];
    const pendingDirectories = [directoryPath];

    while (pendingDirectories.length > 0) {
        const currentDirectory = pendingDirectories.pop();

        if (!isDefined(currentDirectory)) {
            continue;
        }

        const currentDirectoryContents = collectDirectoryFiles(
            currentDirectory,
            predicate
        );

        pendingDirectories.push(...currentDirectoryContents.pendingDirectories);
        discoveredFiles.push(...currentDirectoryContents.discoveredFiles);
    }

    return discoveredFiles.toSorted((left, right) => left.localeCompare(right));
};
