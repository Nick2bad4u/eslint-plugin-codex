/**
 * @packageDocumentation
 * ESLint rule implementation for `require-valid-skill-description`.
 */
import { isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isSkillFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import {
    extractFrontmatter,
    getFrontmatterValue,
    hasFrontmatterField,
} from "../_internal/frontmatter.js";
import {
    createMarkdownDocumentListener,
    reportAtDocumentStart,
} from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

/** Enforce the Agent Skills description type and length contract. */
const requireValidSkillDescriptionRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isSkillFilePath(context.filename)) {
                return;
            }

            const frontmatter = extractFrontmatter(context.sourceCode.text);

            if (
                frontmatter === null ||
                isDefined(frontmatter.error) ||
                !hasFrontmatterField(frontmatter, "description")
            ) {
                return;
            }

            const description = getFrontmatterValue(frontmatter, "description");

            if (
                typeof description === "string" &&
                description.trim().length > 0 &&
                description.length <= 1024
            ) {
                return;
            }

            reportAtDocumentStart(context, {
                messageId: "invalidDescription",
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
                "require Agent Skills descriptions to be non-empty strings of at most 1024 characters.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-valid-skill-description"),
        },
        messages: {
            invalidDescription:
                "Skill description must be a non-empty string no longer than 1024 characters.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-valid-skill-description",
});

export default requireValidSkillDescriptionRule;
