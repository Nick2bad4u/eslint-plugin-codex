/**
 * @packageDocumentation
 * Helpers for working with Markdown customization file bodies.
 */
import { extractFrontmatter } from "./frontmatter.js";

/** Extract the Markdown body and its absolute character offset. */
export const getCustomizationBodyWithOffset = (
    sourceText: string
): Readonly<{
    body: string;
    offset: number;
}> => {
    const frontmatter = extractFrontmatter(sourceText);
    const body = frontmatter?.body ?? sourceText;

    return {
        body,
        offset: sourceText.length - body.length,
    };
};
