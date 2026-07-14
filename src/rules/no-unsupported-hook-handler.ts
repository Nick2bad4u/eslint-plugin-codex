/**
 * @packageDocumentation
 * ESLint rule implementation for `no-unsupported-hook-handler`.
 */
import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { createCodexRule } from "../_internal/create-codex-rule.js";
import { createHookDocumentListener } from "../_internal/hook-rule.js";
import {
    getHookEventEntriesFromHooks,
    isJsonArray,
    isJsonObject,
} from "../_internal/hooks-json.js";
import { reportAtDocumentStart } from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

/** Report hook shapes Codex parses but does not currently execute. */
const noUnsupportedHookHandlerRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createHookDocumentListener(context, (document) => {
            for (const [eventName, rawGroups] of getHookEventEntriesFromHooks(
                document.hooks
            )) {
                if (!isJsonArray(rawGroups)) {
                    continue;
                }

                for (const rawGroup of rawGroups) {
                    if (!isJsonObject(rawGroup)) {
                        continue;
                    }

                    const handlers = rawGroup["hooks"];

                    if (!isJsonArray(handlers)) {
                        continue;
                    }

                    for (const handler of handlers) {
                        if (!isJsonObject(handler)) {
                            continue;
                        }

                        if (handler["async"] === true) {
                            reportAtDocumentStart(context, {
                                data: {
                                    eventName,
                                },
                                messageId: "unsupportedAsyncHandler",
                            });
                        }

                        if (handler["type"] !== "command") {
                            reportAtDocumentStart(context, {
                                data: {
                                    eventName,
                                    type:
                                        typeof handler["type"] === "string"
                                            ? handler["type"]
                                            : "(missing)",
                                },
                                messageId: "unsupportedHandlerType",
                            });
                        }
                    }
                }
            }
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
                "disallow hook handler modes that current Codex releases skip.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-unsupported-hook-handler"),
        },
        messages: {
            unsupportedAsyncHandler:
                "Codex skips async handlers for {{eventName}}. Remove async or set it to false.",
            unsupportedHandlerType:
                "Codex currently executes only command hook handlers; {{eventName}} uses `{{type}}`.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-unsupported-hook-handler",
});

export default noUnsupportedHookHandlerRule;
