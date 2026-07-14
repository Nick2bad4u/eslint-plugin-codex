/**
 * @packageDocumentation
 * ESLint rule implementation for `no-ignored-project-config-keys`.
 */
import { isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isProjectConfigFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import {
    createTomlDocumentListener,
    reportTomlDocumentProblem,
} from "../_internal/toml-rule.js";

const IGNORED_PROJECT_KEYS = [
    "apps_mcp_product_sku",
    "chatgpt_base_url",
    "experimental_realtime_ws_base_url",
    "model_provider",
    "model_providers",
    "notify",
    "openai_base_url",
    "otel",
    "profile",
    "profiles",
] as const;

/** Report settings that Codex deliberately ignores in project config layers. */
const noIgnoredProjectConfigKeysRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createTomlDocumentListener(context, (document) => {
            if (!isProjectConfigFilePath(context.filename)) {
                return;
            }

            for (const key of IGNORED_PROJECT_KEYS) {
                if (!isDefined(document[key])) {
                    continue;
                }

                reportTomlDocumentProblem(context, {
                    data: {
                        key,
                    },
                    messageId: "ignoredProjectConfigKey",
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
                "disallow Codex settings that are ignored in project .codex/config.toml layers.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-ignored-project-config-keys"),
        },
        messages: {
            ignoredProjectConfigKey:
                "Codex ignores `{{key}}` in project config. Move it to the appropriate user, profile, or managed layer.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-ignored-project-config-keys",
});

export default noIgnoredProjectConfigKeysRule;
