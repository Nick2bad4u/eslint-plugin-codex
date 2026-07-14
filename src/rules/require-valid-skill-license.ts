import { isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isSkillFilePath } from "../_internal/codex-file-kind.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `require-valid-skill-license`.
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

/** Rule module for `require-valid-skill-license`. */
const requireValidSkillLicenseRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isSkillFilePath(context.filename)) {
                return;
            }

            const frontmatter = extractFrontmatter(context.sourceCode.text);

            if (
                frontmatter === null ||
                isDefined(frontmatter.error) ||
                !hasFrontmatterField(frontmatter, "license")
            ) {
                return;
            }

            if (isDefined(getFrontmatterScalar(frontmatter, "license"))) {
                return;
            }

            reportAtDocumentStart(context, {
                messageId: "invalidSkillLicense",
            });
        }),
    meta: {
        deprecated: false,
        docs: {
            codexConfigs: ["codex.configs.strict", "codex.configs.all"],
            description:
                "require optional Agent Skills license metadata to be a non-empty string when present.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-valid-skill-license"),
        },
        messages: {
            invalidSkillLicense:
                "Skill license metadata must be a non-empty string when present.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-valid-skill-license",
});

export default requireValidSkillLicenseRule;
