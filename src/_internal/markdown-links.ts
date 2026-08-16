/**
 * @packageDocumentation
 * Shared Markdown link extraction helpers for Codex customization files.
 */
import { isDefined, stringSplit } from "ts-extras";

import {
    isNonRelativeWorkspacePath,
    isRelativeWorkspacePath,
    resolveRelativeWorkspacePath,
} from "./file-system.js";

const FENCED_BACKTICK_CODE_BLOCK_PATTERN = /```[\s\S]*?```/gv;
const FENCED_TILDE_CODE_BLOCK_PATTERN = /~~~[\s\S]*?~~~/gv;
const INLINE_CODE_PATTERN = /`[^\n\r`]+`/gv;

/** Extracted Markdown link plus its source range. */
export type MarkdownLinkMatch = Readonly<{
    destination: string;
    end: number;
    rawDestination: string;
    start: number;
    text: string;
}>;

/** Replace code spans and fences so link matching ignores code content. */
const maskMarkdownCode = (text: string): string =>
    text
        .replaceAll(FENCED_BACKTICK_CODE_BLOCK_PATTERN, (match) =>
            match.replaceAll(/[^\n\r]/gv, " ")
        )
        .replaceAll(FENCED_TILDE_CODE_BLOCK_PATTERN, (match) =>
            match.replaceAll(/[^\n\r]/gv, " ")
        )
        .replaceAll(INLINE_CODE_PATTERN, (match) =>
            match.replaceAll(/[^\n\r]/gv, " ")
        );

/** Normalize a raw Markdown link destination by removing wrappers and titles. */
const extractMarkdownLinkDestination = (rawDestination: string): string => {
    const trimmedDestination = rawDestination.trim();

    if (
        trimmedDestination.startsWith("<") &&
        trimmedDestination.endsWith(">")
    ) {
        return trimmedDestination.slice(1, -1).trim();
    }

    const normalizedDestination = trimmedDestination.replaceAll(/\s+/gv, " ");
    const [destination] = stringSplit(normalizedDestination, " ");

    return destination?.trim() ?? "";
};

type MarkdownLinkScanResult = Readonly<{
    link?: MarkdownLinkMatch;
    searchOffset: number;
}>;

/** Scan one candidate Markdown link from the supplied source offset. */
const scanMarkdownLink = (
    maskedText: string,
    searchOffset: number,
    offset: number
): MarkdownLinkScanResult | undefined => {
    const textStart = maskedText.indexOf("[", searchOffset);

    if (textStart === -1) {
        return undefined;
    }

    if (textStart > 0 && maskedText[textStart - 1] === "!") {
        return { searchOffset: textStart + 1 };
    }

    const textEnd = maskedText.indexOf("](", textStart + 1);

    if (textEnd === -1) {
        return undefined;
    }

    const linkText = maskedText.slice(textStart + 1, textEnd);

    if (
        linkText.length === 0 ||
        linkText.includes("]") ||
        linkText.includes("\n") ||
        linkText.includes("\r")
    ) {
        return { searchOffset: textStart + 1 };
    }

    const destinationStart = textEnd + 2;
    const destinationEnd = maskedText.indexOf(")", destinationStart);

    if (destinationEnd === -1) {
        return undefined;
    }

    const rawDestination = maskedText.slice(destinationStart, destinationEnd);

    if (
        rawDestination.length === 0 ||
        rawDestination.includes("\n") ||
        rawDestination.includes("\r")
    ) {
        return { searchOffset: textStart + 1 };
    }

    const matchedText = maskedText.slice(textStart, destinationEnd + 1);
    const start = offset + textStart;

    return {
        link: {
            destination: extractMarkdownLinkDestination(rawDestination),
            end: start + matchedText.length,
            rawDestination,
            start,
            text: matchedText,
        },
        searchOffset: destinationEnd + 1,
    };
};

/** Extract Markdown links from text while ignoring code spans and fences. */
export const extractMarkdownLinks = (
    text: string,
    offset = 0
): readonly MarkdownLinkMatch[] => {
    const maskedText = maskMarkdownCode(text);
    const links: MarkdownLinkMatch[] = [];
    let searchOffset = 0;

    while (searchOffset < maskedText.length) {
        const result = scanMarkdownLink(maskedText, searchOffset, offset);

        if (!isDefined(result)) {
            break;
        }

        if (isDefined(result.link)) {
            links.push(result.link);
        }

        searchOffset = result.searchOffset;
    }

    return links;
};

/** Determine whether a Markdown link target is a non-relative workspace path. */
export const isInvalidWorkspaceLinkDestination = (
    destination: string
): boolean => isNonRelativeWorkspacePath(destination);

/** Determine whether a Markdown link target is a relative workspace path. */
export const isRelativeWorkspaceLinkDestination = (
    destination: string
): boolean => isRelativeWorkspacePath(destination);

/** Resolve a relative Markdown workspace link from a file path. */
export const resolveMarkdownWorkspaceLink = (
    currentFilePath: string,
    destination: string
): string => resolveRelativeWorkspacePath(currentFilePath, destination);
