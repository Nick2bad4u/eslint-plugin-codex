import type { UnknownRecord } from "type-fest";

import { arrayAt, objectHasOwn } from "ts-extras";
/**
 * @packageDocumentation
 * YAML frontmatter helpers for Codex Markdown customization files.
 */
import { parseDocument } from "yaml";

/** Parsed YAML frontmatter and the Markdown body that follows it. */
export type FrontmatterDocument = Readonly<{
    body: string;
    content: string;
    data: Readonly<UnknownRecord>;
    error: string | undefined;
    offset: number;
}>;

const FRONTMATTER_PATTERN = /^---\r?\n(?<content>[\s\S]*?)\r?\n---(?:\r?\n|$)/v;

const isRecord = (value: unknown): value is UnknownRecord =>
    typeof value === "object" && value !== null && !Array.isArray(value);

const getErrorMessage = (error: unknown): string => {
    if (typeof error !== "object" || error === null) {
        return String(error);
    }

    const message: unknown = Reflect.get(error, "message");

    return typeof message === "string" ? message : "Unknown YAML parsing error";
};

/** Extract and safely parse top-of-file YAML frontmatter when present. */
export const extractFrontmatter = (
    text: string
): FrontmatterDocument | null => {
    const match = FRONTMATTER_PATTERN.exec(text);

    if (match === null) {
        return null;
    }

    const content = match.groups?.["content"] ?? "";
    const document = parseDocument(content, {
        prettyErrors: false,
        schema: "core",
        uniqueKeys: true,
    });
    const firstError = arrayAt(document.errors, 0);
    let parsedValue: unknown;

    try {
        parsedValue = document.toJS({ maxAliasCount: 100 });
    } catch (error: unknown) {
        return {
            body: text.slice(match[0].length),
            content,
            data: {},
            error: getErrorMessage(error),
            offset: match[0].length,
        };
    }

    return {
        body: text.slice(match[0].length),
        content,
        data: isRecord(parsedValue) ? parsedValue : {},
        error: firstError?.message,
        offset: match[0].length,
    };
};

/** Read a non-empty string frontmatter value. */
export const getFrontmatterScalar = (
    document: FrontmatterDocument,
    key: string
): string | undefined => {
    const value = document.data[key];

    return typeof value === "string" && value.trim().length > 0
        ? value.trim()
        : undefined;
};

/** Read an unmodified parsed frontmatter value. */
export const getFrontmatterValue = (
    document: FrontmatterDocument,
    key: string
): unknown => document.data[key];

/** Determine whether frontmatter declares a field, including empty values. */
export const hasFrontmatterField = (
    document: FrontmatterDocument,
    key: string
): boolean => objectHasOwn(document.data, key);

/** Remove balanced HTML comments before checking Markdown body content. */
export const getMeaningfulMarkdownBody = (text: string): string =>
    text.replaceAll(/<!--[\s\S]*?-->/gv, "").trim();
