/**
 * @packageDocumentation
 * Cross-format listener helpers for Codex hooks in JSON and TOML.
 */
import type { TSESLint } from "@typescript-eslint/utils";
import type { AST } from "toml-eslint-parser";
import type { UnknownArray } from "type-fest";

import { getStaticTOMLValue } from "toml-eslint-parser";
import { isDefined } from "ts-extras";

import {
    isHooksJsonFilePath,
    isProjectConfigFilePath,
} from "./codex-file-kind.js";
import { isJsonObject, parseJsonText } from "./hooks-json.js";
import { isTomlObject } from "./toml-rule.js";

/** A selected hooks value and the representation that supplied it. */
export interface CodexHooksDocument {
    /** Static value of the top-level `hooks` property, if present. */
    readonly hooks: unknown;
    /** Whether this file exists solely to define hooks. */
    readonly requiresHooksObject: boolean;
}

/** Create a listener that normalizes hooks.json and inline config.toml hooks. */
export const createHookDocumentListener = <MessageIds extends string>(
    context: Readonly<TSESLint.RuleContext<MessageIds, Readonly<UnknownArray>>>,
    lintDocument: (document: Readonly<CodexHooksDocument>) => void
): TSESLint.RuleListener => ({
    Document(): void {
        if (!isHooksJsonFilePath(context.filename)) {
            return;
        }

        const root = parseJsonText(context.sourceCode.text);

        lintDocument({
            hooks: isJsonObject(root) ? root["hooks"] : undefined,
            requiresHooksObject: true,
        });
    },
    Program(node): void {
        if (!isProjectConfigFilePath(context.filename)) {
            return;
        }

        // The TOML parser dispatches this listener with its TOMLProgram node.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ESLint's shared listener type cannot express parser-specific program nodes.
        const tomlProgram = node as unknown as AST.TOMLProgram;
        const root = getStaticTOMLValue(tomlProgram);

        if (!isTomlObject(root) || !isDefined(root["hooks"])) {
            return;
        }

        lintDocument({
            hooks: root["hooks"],
            requiresHooksObject: false,
        });
    },
});
