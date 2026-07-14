import { isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import {
    getSkillDirectoryName,
    getSkillName,
} from "../_internal/codex-customization-names.js";
import { isSkillFilePath } from "../_internal/codex-file-kind.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `require-skill-name-match-directory`.
 */
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

/** Rule module for `require-skill-name-match-directory`. */
const requireSkillNameMatchDirectoryRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isSkillFilePath(context.filename)) {
                return;
            }

            const frontmatter = extractFrontmatter(context.sourceCode.text);
            const explicitSkillName =
                frontmatter === null || isDefined(frontmatter.error)
                    ? undefined
                    : getFrontmatterScalar(frontmatter, "name");

            if (!isDefined(explicitSkillName)) {
                return;
            }

            const skillName = getSkillName(context.filename, frontmatter);
            const directoryName = getSkillDirectoryName(context.filename);

            if (skillName === directoryName) {
                return;
            }

            reportAtDocumentStart(context, {
                data: {
                    directoryName,
                    name: skillName,
                },
                messageId: "skillNameDoesNotMatchDirectory",
            });
        }),
    meta: {
        deprecated: false,
        docs: {
            codexConfigs: ["codex.configs.strict", "codex.configs.all"],
            description:
                "require Agent Skills name metadata to match the parent directory name.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-skill-name-match-directory"),
        },
        messages: {
            skillNameDoesNotMatchDirectory:
                "Skill name `{{name}}` must match its parent directory name `{{directoryName}}`.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-skill-name-match-directory",
});

export default requireSkillNameMatchDirectoryRule;
