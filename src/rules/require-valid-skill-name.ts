import { isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import {
    getSkillName,
    isValidSkillIdentifier,
} from "../_internal/codex-customization-names.js";
import { isSkillFilePath } from "../_internal/codex-file-kind.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `require-valid-skill-name`.
 */
import { createCodexRule } from "../_internal/create-codex-rule.js";
import {
    extractFrontmatter,
    getFrontmatterScalar,
    hasFrontmatterField,
} from "../_internal/frontmatter.js";
import {
    createMarkdownDocumentListener,
    reportAtDocumentStart,
} from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

/** Rule module for `require-valid-skill-name`. */
const requireValidSkillNameRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isSkillFilePath(context.filename)) {
                return;
            }

            const frontmatter = extractFrontmatter(context.sourceCode.text);

            if (
                frontmatter === null ||
                isDefined(frontmatter.error) ||
                !hasFrontmatterField(frontmatter, "name")
            ) {
                return;
            }

            const skillName = getFrontmatterScalar(frontmatter, "name");

            if (
                isDefined(skillName) &&
                isValidSkillIdentifier(
                    getSkillName(context.filename, frontmatter)
                )
            ) {
                return;
            }

            reportAtDocumentStart(context, {
                data: {
                    name: skillName ?? "(empty)",
                },
                messageId: "invalidSkillName",
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
                "require Agent Skills names to follow the standard lowercase-hyphen identifier contract.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-valid-skill-name"),
        },
        messages: {
            invalidSkillName:
                "Skill names must be 1-64 characters, use lowercase letters, digits, and single hyphens, and may not start or end with a hyphen (current value: `{{name}}`).",
        },
        schema: [],
        type: "problem",
    },
    name: "require-valid-skill-name",
});

export default requireValidSkillNameRule;
