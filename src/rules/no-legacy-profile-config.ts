/**
 * @packageDocumentation
 * ESLint rule implementation for `no-legacy-profile-config`.
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

/** Reject profile syntax removed in favor of standalone profile files. */
const noLegacyProfileConfigRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createTomlDocumentListener(context, (document) => {
            if (!isCodexConfigFilePath(context.filename)) {
                return;
            }

            for (const key of ["profile", "profiles"] as const) {
                if (!isDefined(document[key])) {
                    continue;
                }

                reportTomlDocumentProblem(context, {
                    data: {
                        key,
                    },
                    messageId: "legacyProfileConfig",
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
            description: "disallow removed inline Codex profile configuration.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-legacy-profile-config"),
        },
        messages: {
            legacyProfileConfig:
                "The top-level `{{key}}` profile syntax is no longer supported. Move profile overrides to a standalone $CODEX_HOME/<name>.config.toml file.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-legacy-profile-config",
});

export default noLegacyProfileConfigRule;
