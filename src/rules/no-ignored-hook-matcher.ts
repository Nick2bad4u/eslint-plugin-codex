/**
 * @packageDocumentation
 * ESLint rule implementation for `no-ignored-hook-matcher`.
 */
import { isDefined, setHas } from "ts-extras";

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

const EVENTS_WITHOUT_MATCHERS: ReadonlySet<string> = new Set([
    "Stop",
    "UserPromptSubmit",
]);

/** Report matcher fields that Codex ignores for their event. */
const noIgnoredHookMatcherRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createHookDocumentListener(context, (document) => {
            for (const [eventName, rawGroups] of getHookEventEntriesFromHooks(
                document.hooks
            )) {
                if (
                    !setHas(EVENTS_WITHOUT_MATCHERS, eventName) ||
                    !isJsonArray(rawGroups)
                ) {
                    continue;
                }

                if (
                    rawGroups.some(
                        (group) =>
                            isJsonObject(group) && isDefined(group["matcher"])
                    )
                ) {
                    reportAtDocumentStart(context, {
                        data: {
                            eventName,
                        },
                        messageId: "ignoredMatcher",
                    });
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
                "disallow matcher fields on Codex hook events that ignore them.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-ignored-hook-matcher"),
        },
        messages: {
            ignoredMatcher:
                "Codex ignores matcher on {{eventName}} hooks. Remove it so the configuration does not imply filtering that never occurs.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-ignored-hook-matcher",
});

export default noIgnoredHookMatcherRule;
