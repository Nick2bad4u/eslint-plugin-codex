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
    type JsonArray,
} from "../_internal/hooks-json.js";
import { reportAtDocumentStart } from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

type HookStructureProblem = Readonly<{
    data: Readonly<Record<string, string>>;
    messageId:
        | "invalidHandler"
        | "invalidHandlers"
        | "invalidMatcherGroup"
        | "invalidMatcherGroups"
        | "missingCommand";
}>;

const getHandlerProblems = (
    eventName: string,
    groupIndex: string,
    handlers: JsonArray
): readonly HookStructureProblem[] =>
    handlers.flatMap<HookStructureProblem>((handler, handlerIndex) => {
        const data = {
            eventName,
            groupIndex,
            handlerIndex: String(handlerIndex),
        };

        if (!isJsonObject(handler)) {
            return [{ data, messageId: "invalidHandler" as const }];
        }

        if (
            handler["type"] === "command" &&
            (typeof handler["command"] !== "string" ||
                handler["command"].trim().length === 0)
        ) {
            return [{ data, messageId: "missingCommand" as const }];
        }

        return [];
    });

const getMatcherGroupProblems = (
    eventName: string,
    rawGroups: unknown
): readonly HookStructureProblem[] => {
    if (!isJsonArray(rawGroups) || isEmpty(rawGroups)) {
        return [
            {
                data: { eventName },
                messageId: "invalidMatcherGroups",
            },
        ];
    }

    return rawGroups.flatMap<HookStructureProblem>(
        (rawGroup, groupIndex): readonly HookStructureProblem[] => {
            const stringGroupIndex = String(groupIndex);
            const data = {
                eventName,
                groupIndex: stringGroupIndex,
            };

            if (!isJsonObject(rawGroup)) {
                return [{ data, messageId: "invalidMatcherGroup" as const }];
            }

            const handlers = rawGroup["hooks"];

            if (!isJsonArray(handlers) || isEmpty(handlers)) {
                return [{ data, messageId: "invalidHandlers" as const }];
            }

            return getHandlerProblems(eventName, stringGroupIndex, handlers);
        }
    );
};

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
                for (const problem of getMatcherGroupProblems(
                    eventName,
                    rawGroups
                )) {
                    reportAtDocumentStart(context, {
                        data: problem.data,
                        messageId: problem.messageId,
                    });
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
        languages: [
            "js/js",
            "json/json",
            "toml/toml",
        ],
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
