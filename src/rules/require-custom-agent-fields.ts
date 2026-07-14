/**
 * @packageDocumentation
 * ESLint rule implementation for `require-custom-agent-fields`.
 */
import { isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isCustomAgentFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import {
    createTomlDocumentListener,
    getTomlString,
    reportTomlDocumentProblem,
} from "../_internal/toml-rule.js";

const REQUIRED_AGENT_FIELDS = [
    "description",
    "developer_instructions",
    "name",
] as const;

/** Require the three fields Codex uses to define a standalone custom agent. */
const requireCustomAgentFieldsRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createTomlDocumentListener(context, (document) => {
            if (!isCustomAgentFilePath(context.filename)) {
                return;
            }

            for (const field of REQUIRED_AGENT_FIELDS) {
                if (isDefined(getTomlString(document, field))) {
                    continue;
                }

                reportTomlDocumentProblem(context, {
                    data: {
                        field,
                    },
                    messageId: "missingAgentField",
                });
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
                "require standalone Codex custom agents to declare non-empty name, description, and developer_instructions strings.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-custom-agent-fields"),
        },
        messages: {
            missingAgentField:
                "Codex custom agents must declare a non-empty string `{{field}}` field.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-custom-agent-fields",
});

export default requireCustomAgentFieldsRule;
