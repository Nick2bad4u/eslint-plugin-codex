/**
 * @packageDocumentation
 * ESLint rule implementation for `no-empty-agents-md`.
 */
import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isAgentsFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import {
    extractFrontmatter,
    hasMeaningfulMarkdownBody,
} from "../_internal/frontmatter.js";
import {
    createMarkdownDocumentListener,
    reportAtDocumentStart,
} from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

/** Disallow instruction files that Codex will skip as empty. */
const noEmptyAgentsMdRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isAgentsFilePath(context.filename)) {
                return;
            }

            const sourceText = context.sourceCode.text;
            const frontmatter = extractFrontmatter(sourceText);
            if (hasMeaningfulMarkdownBody(frontmatter?.body ?? sourceText)) {
                return;
            }

            reportAtDocumentStart(context, {
                messageId: "emptyInstructions",
            });
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
                "disallow empty AGENTS.md and AGENTS.override.md files that Codex ignores.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-empty-agents-md"),
        },
        messages: {
            emptyInstructions:
                "Codex ignores empty instruction files. Add actionable Markdown guidance or remove this file.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-empty-agents-md",
});

export default noEmptyAgentsMdRule;
