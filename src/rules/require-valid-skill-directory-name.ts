import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import {
    getSkillDirectoryName,
    isValidSkillIdentifier,
} from "../_internal/codex-customization-names.js";
import { isSkillFilePath } from "../_internal/codex-file-kind.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `require-valid-skill-directory-name`.
 */
import { createCodexRule } from "../_internal/create-codex-rule.js";
import {
    createMarkdownDocumentListener,
    reportAtDocumentStart,
} from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

/** Rule module for `require-valid-skill-directory-name`. */
const requireValidSkillDirectoryNameRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isSkillFilePath(context.filename)) {
                return;
            }

            const directoryName = getSkillDirectoryName(context.filename);

            if (isValidSkillIdentifier(directoryName)) {
                return;
            }

            reportAtDocumentStart(context, {
                data: {
                    directoryName,
                },
                messageId: "invalidSkillDirectoryName",
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
                "require Agent Skills directory names to follow the standard lowercase-hyphen identifier contract.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-valid-skill-directory-name"),
        },
        messages: {
            invalidSkillDirectoryName:
                "Skill directory names must be 1-64 characters, use lowercase letters, digits, and single hyphens, and may not start or end with a hyphen (current directory: `{{directoryName}}`).",
        },
        schema: [],
        type: "problem",
    },
    name: "require-valid-skill-directory-name",
});

export default requireValidSkillDirectoryNameRule;
