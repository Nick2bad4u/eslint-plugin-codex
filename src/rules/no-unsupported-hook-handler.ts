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
    type JsonObject,
} from "../_internal/hooks-json.js";
import { reportAtDocumentStart } from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

const getHookHandlers = (rawGroups: unknown): readonly JsonObject[] =>
    isJsonArray(rawGroups)
        ? rawGroups.flatMap((rawGroup) => {
              if (!isJsonObject(rawGroup)) {
                  return [];
              }

              const handlers = rawGroup["hooks"];

              return isJsonArray(handlers)
                  ? handlers.filter((handler) => isJsonObject(handler))
                  : [];
          })
        : [];

/** Report hook shapes Codex parses but does not currently execute. */
const noUnsupportedHookHandlerRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createHookDocumentListener(context, (document) => {
            for (const [eventName, rawGroups] of getHookEventEntriesFromHooks(
                document.hooks
            )) {
                for (const handler of getHookHandlers(rawGroups)) {
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
        languages: ["js/js", "json/json"],
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
