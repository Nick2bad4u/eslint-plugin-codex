/**
 * @packageDocumentation
 * ESLint rule implementation for `require-skill-location`.
 */
import path from "node:path";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { createCodexRule } from "../_internal/create-codex-rule.js";
import {
    createMarkdownDocumentListener,
    reportAtDocumentStart,
} from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import { isValidSkillDefinitionLocation } from "../_internal/skill-files.js";

/** Require SKILL.md files to live in a Codex-discoverable skill directory. */
const requireSkillLocationRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (
                path.basename(context.filename) !== "SKILL.md" ||
                isValidSkillDefinitionLocation(context.filename)
            ) {
                return;
            }

            reportAtDocumentStart(context, {
                messageId: "invalidSkillLocation",
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
                "require SKILL.md files to live in a Codex-supported Agent Skills directory.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-skill-location"),
        },
        messages: {
            invalidSkillLocation:
                "Place this skill at .agents/skills/<name>/SKILL.md, skills/<name>/SKILL.md in a plugin, or another Codex-supported Agent Skills root.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-skill-location",
});

export default requireSkillLocationRule;
