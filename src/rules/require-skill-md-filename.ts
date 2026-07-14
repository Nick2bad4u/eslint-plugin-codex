import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isSkillMarkdownFilePath } from "../_internal/codex-file-kind.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `require-skill-md-filename`.
 */
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { extractFrontmatter } from "../_internal/frontmatter.js";
import {
    createMarkdownDocumentListener,
    reportAtDocumentStart,
} from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import {
    getSkillFileBasename,
    looksLikeSkillDefinitionDocument,
} from "../_internal/skill-files.js";

/** Rule module for `require-skill-md-filename`. */
const requireSkillMdFilenameRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isSkillMarkdownFilePath(context.filename)) {
                return;
            }

            const basename = getSkillFileBasename(context.filename);

            if (basename === "SKILL.md") {
                return;
            }

            const frontmatter = extractFrontmatter(context.sourceCode.text);

            if (!looksLikeSkillDefinitionDocument(frontmatter)) {
                return;
            }

            reportAtDocumentStart(context, {
                data: {
                    basename,
                },
                messageId: "invalidSkillDefinitionFilename",
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
                "require Markdown files that declare Agent Skills metadata to use the SKILL.md filename.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-skill-md-filename"),
        },
        messages: {
            invalidSkillDefinitionFilename:
                "Skill-definition markdown files should be named `SKILL.md`, not `{{basename}}`.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-skill-md-filename",
});

export default requireSkillMdFilenameRule;
