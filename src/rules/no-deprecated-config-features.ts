/**
 * @packageDocumentation
 * ESLint rule implementation for `no-deprecated-config-features`.
 */
import { isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isCodexConfigFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import {
    createTomlDocumentListener,
    getTomlObject,
    reportTomlDocumentProblem,
} from "../_internal/toml-rule.js";

const DEPRECATED_FEATURES = [
    "codex_hooks",
    "web_search",
    "web_search_cached",
    "web_search_request",
] as const;

const replacementFor = (key: string): string =>
    key === "codex_hooks"
        ? "[features].hooks"
        : "the top-level web_search setting";

/** Report deprecated feature flags with current replacements. */
const noDeprecatedConfigFeaturesRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createTomlDocumentListener(context, (document) => {
            if (!isCodexConfigFilePath(context.filename)) {
                return;
            }

            const features = getTomlObject(document, "features");

            if (!isDefined(features)) {
                return;
            }

            for (const key of DEPRECATED_FEATURES) {
                if (!isDefined(features[key])) {
                    continue;
                }

                reportTomlDocumentProblem(context, {
                    data: {
                        key,
                        replacement: replacementFor(key),
                    },
                    messageId: "deprecatedFeature",
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
                "disallow deprecated Codex feature keys when canonical replacements exist.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-deprecated-config-features"),
        },
        messages: {
            deprecatedFeature:
                "Codex feature `{{key}}` is deprecated. Use {{replacement}} instead.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-deprecated-config-features",
});

export default noDeprecatedConfigFeaturesRule;
