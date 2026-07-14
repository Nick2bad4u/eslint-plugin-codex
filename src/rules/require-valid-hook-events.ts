/**
 * @packageDocumentation
 * ESLint rule implementation for `require-valid-hook-events`.
 */
import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { createCodexRule } from "../_internal/create-codex-rule.js";
import { createHookDocumentListener } from "../_internal/hook-rule.js";
import {
    getHookEventEntriesFromHooks,
    isValidHookEvent,
} from "../_internal/hooks-json.js";
import { reportAtDocumentStart } from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

/** Require hook event keys that the current Codex runtime recognizes. */
const requireValidHookEventsRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createHookDocumentListener(context, (document) => {
            for (const [eventName] of getHookEventEntriesFromHooks(
                document.hooks
            )) {
                if (isValidHookEvent(eventName)) {
                    continue;
                }

                reportAtDocumentStart(context, {
                    data: {
                        eventName,
                    },
                    messageId: "invalidHookEvent",
                });
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
                "require Codex hooks to use current lifecycle event names.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-valid-hook-events"),
        },
        messages: {
            invalidHookEvent:
                "Codex does not recognize hook event `{{eventName}}`.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-valid-hook-events",
});

export default requireValidHookEventsRule;
