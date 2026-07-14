/**
 * @packageDocumentation
 * ESLint rule implementation for `no-mixed-permission-models`.
 */
import { isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isCodexConfigFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import {
    createTomlDocumentListener,
    reportTomlDocumentProblem,
} from "../_internal/toml-rule.js";

/** Prevent the non-composing permission and legacy sandbox models from mixing. */
const noMixedPermissionModelsRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createTomlDocumentListener(context, (document) => {
            if (!isCodexConfigFilePath(context.filename)) {
                return;
            }

            const hasPermissionProfile =
                isDefined(document["default_permissions"]) ||
                isDefined(document["permissions"]);
            const hasLegacySandbox =
                isDefined(document["sandbox_mode"]) ||
                isDefined(document["sandbox_workspace_write"]);

            if (!hasPermissionProfile || !hasLegacySandbox) {
                return;
            }

            reportTomlDocumentProblem(context, {
                messageId: "mixedPermissionModels",
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
                "disallow mixing named permission profiles with legacy sandbox settings that take precedence.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-mixed-permission-models"),
        },
        messages: {
            mixedPermissionModels:
                "Named permissions and legacy sandbox settings do not compose; sandbox_mode or sandbox_workspace_write takes precedence. Choose one permission model.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-mixed-permission-models",
});

export default noMixedPermissionModelsRule;
