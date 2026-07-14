/**
 * @packageDocumentation
 * ESLint rule implementation for `no-mixed-hook-representations`.
 */
import path from "node:path";
import { isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isProjectConfigFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { pathExists } from "../_internal/file-system.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import {
    createTomlDocumentListener,
    reportTomlDocumentProblem,
} from "../_internal/toml-rule.js";

/** Prefer one hook representation per active Codex config layer. */
const noMixedHookRepresentationsRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createTomlDocumentListener(context, (document) => {
            if (
                !isProjectConfigFilePath(context.filename) ||
                !isDefined(document["hooks"]) ||
                !pathExists(
                    path.join(path.dirname(context.filename), "hooks.json")
                )
            ) {
                return;
            }

            reportTomlDocumentProblem(context, {
                messageId: "mixedHookRepresentations",
            });
        }),
    meta: {
        deprecated: false,
        docs: {
            codexConfigs: [
                "codex.configs.recommended",
                "codex.configs.strict",
                "codex.configs.all",
            ],
            description:
                "disallow both hooks.json and inline hooks in the same Codex config layer.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-mixed-hook-representations"),
        },
        messages: {
            mixedHookRepresentations:
                "This .codex layer defines both hooks.json and inline [hooks]. Codex merges them and warns; keep one representation per layer.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-mixed-hook-representations",
});

export default noMixedHookRepresentationsRule;
