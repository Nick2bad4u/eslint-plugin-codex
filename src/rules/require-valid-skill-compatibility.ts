/**
 * @packageDocumentation
 * ESLint rule implementation for `require-valid-skill-compatibility`.
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

/** Validate optional Agent Skills compatibility metadata. */
const requireValidSkillCompatibilityRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isSkillFilePath(context.filename)) {
                return;
            }

            const frontmatter = extractFrontmatter(context.sourceCode.text);

            if (
                frontmatter === null ||
                isDefined(frontmatter.error) ||
                !hasFrontmatterField(frontmatter, "compatibility")
            ) {
                return;
            }

            const compatibility = getFrontmatterValue(
                frontmatter,
                "compatibility"
            );

            if (
                typeof compatibility === "string" &&
                compatibility.trim().length > 0 &&
                compatibility.length <= 500
            ) {
                return;
            }

            reportAtDocumentStart(context, {
                messageId: "invalidCompatibility",
            });
        }),
    meta: {
        deprecated: false,
        docs: {
            codexConfigs: ["codex.configs.strict", "codex.configs.all"],
            description:
                "require optional Agent Skills compatibility metadata to be a non-empty string of at most 500 characters.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-valid-skill-compatibility"),
        },
        messages: {
            invalidCompatibility:
                "Skill compatibility must be a non-empty string no longer than 500 characters.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-valid-skill-compatibility",
});

export default requireValidSkillCompatibilityRule;
