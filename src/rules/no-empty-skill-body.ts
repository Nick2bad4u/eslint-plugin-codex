/**
 * @packageDocumentation
 * ESLint rule implementation for `no-empty-skill-body`.
 */
import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isSkillFilePath } from "../_internal/codex-file-kind.js";
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

/** Disallow skill definitions without executable guidance. */
const noEmptySkillBodyRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isSkillFilePath(context.filename)) {
                return;
            }

            const sourceText = context.sourceCode.text;
            const body = extractFrontmatter(sourceText)?.body ?? sourceText;

            if (hasMeaningfulMarkdownBody(body)) {
                return;
            }

            reportAtDocumentStart(context, {
                messageId: "emptySkillBody",
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
                "disallow Codex skills without Markdown instructions after frontmatter.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-empty-skill-body"),
        },
        messages: {
            emptySkillBody:
                "A Codex skill needs a non-empty Markdown body with instructions. Metadata alone cannot execute a workflow.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-empty-skill-body",
});

export default noEmptySkillBodyRule;
