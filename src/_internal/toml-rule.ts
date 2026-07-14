/**
 * @packageDocumentation
 * TOML static-value and listener helpers for Codex configuration rules.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { AST } from "toml-eslint-parser";
import type { UnknownArray } from "type-fest";

import { getStaticTOMLValue } from "toml-eslint-parser";

import { isCodexTomlFilePath } from "./codex-file-kind.js";

/** TOML array value after static evaluation. */
export type TomlArray = readonly TomlValue[];

/** TOML table value after static evaluation. */
export interface TomlObject {
    readonly [key: string]: TomlValue;
}

/** TOML scalar, array, or table value after static evaluation. */
export type TomlValue =
    | boolean
    | Date
    | number
    | string
    | TomlArray
    | TomlObject;

/** Determine whether a static TOML value is a table. */
export const isTomlObject = (value: unknown): value is TomlObject =>
    typeof value === "object" &&
    value !== null &&
    !(value instanceof Date) &&
    !Array.isArray(value);

/** Read a TOML table property when it is an object. */
export const getTomlObject = (
    object: TomlObject,
    key: string
): TomlObject | undefined => {
    const value = object[key];

    return isTomlObject(value) ? value : undefined;
};

/** Read a non-empty TOML string property. */
export const getTomlString = (
    object: TomlObject,
    key: string
): string | undefined => {
    const value = object[key];

    return typeof value === "string" && value.trim().length > 0
        ? value.trim()
        : undefined;
};

/** Read a TOML array property. */
export const getTomlArray = (
    object: TomlObject,
    key: string
): TomlArray | undefined => {
    const value = object[key];

    return Array.isArray(value) ? value : undefined;
};

/** Create a listener that supplies a statically evaluated TOML document. */
export const createTomlDocumentListener = (
    context: Readonly<TSESLint.RuleContext<string, Readonly<UnknownArray>>>,
    lintDocument: (document: TomlObject) => void
): TSESLint.RuleListener => ({
    Program(node): void {
        if (!isCodexTomlFilePath(context.filename)) {
            return;
        }

        // The TOML parser dispatches this listener with its TOMLProgram node.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ESLint's shared listener type cannot express parser-specific program nodes.
        const tomlProgram = node as unknown as AST.TOMLProgram;
        const value = getStaticTOMLValue(tomlProgram);

        if (isTomlObject(value)) {
            lintDocument(value);
        }
    },
});

/** Report a TOML document-level diagnostic at the first character. */
export const reportTomlDocumentProblem = <MessageIds extends string>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Readonly<UnknownArray>>>,
    options: Readonly<{
        data?: Readonly<Record<string, string>>;
        messageId: MessageIds;
    }>
): void => {
    context.report({
        ...options,
        loc: {
            end: context.sourceCode.getLocFromIndex(
                Math.min(1, context.sourceCode.text.length)
            ),
            start: context.sourceCode.getLocFromIndex(0),
        },
    });
};
