/**
 * @packageDocumentation
 * ESLint rule implementation for `require-skill-frontmatter`.
 */
import { isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isSkillFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import {
    extractFrontmatter,
    getFrontmatterScalar,
} from "../_internal/frontmatter.js";
import {
    createMarkdownDocumentListener,
    reportAtDocumentStart,
} from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

/** Require the Agent Skills metadata Codex loads for discovery. */
const requireSkillFrontmatterRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isSkillFilePath(context.filename)) {
                return;
            }

            const frontmatter = extractFrontmatter(context.sourceCode.text);

            if (frontmatter === null) {
                reportAtDocumentStart(context, {
                    messageId: "missingFrontmatter",
                });
                return;
            }

            if (isDefined(frontmatter.error)) {
                reportAtDocumentStart(context, {
                    data: {
                        error: frontmatter.error,
                    },
                    messageId: "invalidFrontmatter",
                });
                return;
            }

            if (!isDefined(getFrontmatterScalar(frontmatter, "name"))) {
                reportAtDocumentStart(context, {
                    messageId: "missingName",
                });
            }

            if (!isDefined(getFrontmatterScalar(frontmatter, "description"))) {
                reportAtDocumentStart(context, {
                    messageId: "missingDescription",
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
                "require valid YAML frontmatter with non-empty name and description fields in Codex skills.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-skill-frontmatter"),
        },
        messages: {
            invalidFrontmatter:
                "Skill frontmatter is not valid YAML: {{error}}",
            missingDescription:
                "Skill frontmatter must declare a non-empty string description that explains what the skill does and when to use it.",
            missingFrontmatter:
                "SKILL.md must start with YAML frontmatter declaring name and description.",
            missingName:
                "Skill frontmatter must declare a non-empty string name.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-skill-frontmatter",
});

export default requireSkillFrontmatterRule;
