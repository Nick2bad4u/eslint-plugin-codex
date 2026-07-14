/**
 * @packageDocumentation
 * ESLint rule implementation for `require-valid-hook-structure`.
 */
import { isEmpty } from "ts-extras";

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

/** Validate the event, matcher-group, and handler levels of hooks.json. */
const requireValidHookStructureRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createHookDocumentListener(context, (document) => {
            if (!isJsonObject(document.hooks)) {
                reportAtDocumentStart(context, {
                    messageId: "missingHooksObject",
                });
                return;
            }

            for (const [eventName, rawGroups] of getHookEventEntriesFromHooks(
                document.hooks
            )) {
                if (!isJsonArray(rawGroups) || isEmpty(rawGroups)) {
                    reportAtDocumentStart(context, {
                        data: {
                            eventName,
                        },
                        messageId: "invalidMatcherGroups",
                    });
                    continue;
                }

                for (const [groupIndex, rawGroup] of rawGroups.entries()) {
                    if (!isJsonObject(rawGroup)) {
                        reportAtDocumentStart(context, {
                            data: {
                                eventName,
                                groupIndex: String(groupIndex),
                            },
                            messageId: "invalidMatcherGroup",
                        });
                        continue;
                    }

                    const handlers = rawGroup["hooks"];

                    if (!isJsonArray(handlers) || isEmpty(handlers)) {
                        reportAtDocumentStart(context, {
                            data: {
                                eventName,
                                groupIndex: String(groupIndex),
                            },
                            messageId: "invalidHandlers",
                        });
                        continue;
                    }

                    for (const [handlerIndex, handler] of handlers.entries()) {
                        if (!isJsonObject(handler)) {
                            reportAtDocumentStart(context, {
                                data: {
                                    eventName,
                                    groupIndex: String(groupIndex),
                                    handlerIndex: String(handlerIndex),
                                },
                                messageId: "invalidHandler",
                            });
                            continue;
                        }

                        if (
                            handler["type"] === "command" &&
                            (typeof handler["command"] !== "string" ||
                                handler["command"].trim().length === 0)
                        ) {
                            reportAtDocumentStart(context, {
                                data: {
                                    eventName,
                                    groupIndex: String(groupIndex),
                                    handlerIndex: String(handlerIndex),
                                },
                                messageId: "missingCommand",
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
                "codex.configs.minimal",
                "codex.configs.recommended",
                "codex.configs.strict",
                "codex.configs.all",
            ],
            description:
                "require Codex hooks to follow the event, matcher-group, and handler structure.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-valid-hook-structure"),
        },
        messages: {
            invalidHandler:
                "{{eventName}} matcher group {{groupIndex}} handler {{handlerIndex}} must be an object.",
            invalidHandlers:
                "{{eventName}} matcher group {{groupIndex}} must contain a non-empty hooks handler array.",
            invalidMatcherGroup:
                "{{eventName}} matcher group {{groupIndex}} must be an object.",
            invalidMatcherGroups:
                "Hook event {{eventName}} must contain a non-empty matcher-group array.",
            missingCommand:
                "{{eventName}} matcher group {{groupIndex}} command handler {{handlerIndex}} must declare a non-empty command.",
            missingHooksObject:
                "Codex hook configuration must declare a top-level hooks object.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-valid-hook-structure",
});

export default requireValidHookStructureRule;
