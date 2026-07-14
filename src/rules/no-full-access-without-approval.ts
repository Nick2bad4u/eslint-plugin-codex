/**
 * @packageDocumentation
 * ESLint rule implementation for `no-full-access-without-approval`.
 */
import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isCodexConfigFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import {
    createTomlDocumentListener,
    reportTomlDocumentProblem,
} from "../_internal/toml-rule.js";

/** Flag the configuration that removes both sandbox and approval boundaries. */
const noFullAccessWithoutApprovalRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createTomlDocumentListener(context, (document) => {
            if (
                !isCodexConfigFilePath(context.filename) ||
                document["sandbox_mode"] !== "danger-full-access" ||
                document["approval_policy"] !== "never"
            ) {
                return;
            }

            reportTomlDocumentProblem(context, {
                messageId: "unboundedExecution",
            });
        }),
    meta: {
        deprecated: false,
        docs: {
            codexConfigs: ["codex.configs.strict", "codex.configs.all"],
            description:
                "disallow Codex configuration that combines unrestricted execution with no approval prompts.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-full-access-without-approval"),
        },
        messages: {
            unboundedExecution:
                'danger-full-access with approval_policy = "never" removes both sandbox and approval boundaries. Use a tighter sandbox or an approval policy unless this risk is explicitly required.',
        },
        schema: [],
        type: "suggestion",
    },
    name: "no-full-access-without-approval",
});

export default noFullAccessWithoutApprovalRule;
