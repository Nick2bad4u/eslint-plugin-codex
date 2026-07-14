/**
 * @packageDocumentation
 * ESLint rule implementation for `no-deprecated-custom-prompts`.
 */
import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isLegacyPromptFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import {
    createMarkdownDocumentListener,
    reportAtDocumentStart,
} from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

/** Direct users from deprecated custom prompts to Agent Skills. */
const noDeprecatedCustomPromptsRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isLegacyPromptFilePath(context.filename)) {
                return;
            }

            reportAtDocumentStart(context, {
                messageId: "deprecatedCustomPrompt",
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
                "disallow deprecated .codex/prompts Markdown files in favor of Agent Skills.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-deprecated-custom-prompts"),
        },
        messages: {
            deprecatedCustomPrompt:
                "Codex custom prompts are deprecated. Migrate this workflow to a skill under .agents/skills/<name>/SKILL.md.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-deprecated-custom-prompts",
});

export default noDeprecatedCustomPromptsRule;
