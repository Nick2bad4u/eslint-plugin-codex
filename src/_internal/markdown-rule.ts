/**
 * @packageDocumentation
 * Shared helpers for markdown-backed Codex rules.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { UnknownArray } from "type-fest";

/** Common document-start report location used by markdown rules. */
const createDocumentStartLocation = (
    context: Readonly<TSESLint.RuleContext<string, Readonly<UnknownArray>>>
): TSESLint.AST.SourceLocation => ({
    end: context.sourceCode.getLocFromIndex(
        Math.min(1, context.sourceCode.text.length)
    ),
    start: context.sourceCode.getLocFromIndex(0),
});

/** Report a markdown document-level problem at the start of the file. */
export const reportAtDocumentStart = <MessageIds extends string>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Readonly<UnknownArray>>>,
    options: Readonly<{
        data?: Readonly<Record<string, string>>;
        messageId: MessageIds;
    }>
): void => {
    context.report({
        ...options,
        loc: createDocumentStartLocation(context),
    });
};

/** Create a markdown document listener keyed off the root AST node. */
export const createMarkdownDocumentListener = (
    lintDocument: () => void
): TSESLint.RuleListener => ({
    root() {
        lintDocument();
    },
});
