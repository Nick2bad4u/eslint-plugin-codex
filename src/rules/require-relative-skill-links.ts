import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isSkillFilePath } from "../_internal/codex-file-kind.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `require-relative-skill-links`.
 */
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { getCustomizationBodyWithOffset } from "../_internal/customization-body.js";
import {
    extractMarkdownLinks,
    isInvalidWorkspaceLinkDestination,
} from "../_internal/markdown-links.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

/** Rule module for `require-relative-skill-links`. */
const requireRelativeSkillLinksRule: CodexRuleModule = createCodexRule({
    create: (context) => ({
        root() {
            if (!isSkillFilePath(context.filename)) {
                return;
            }

            const { body, offset } = getCustomizationBodyWithOffset(
                context.sourceCode.text
            );

            for (const link of extractMarkdownLinks(body, offset)) {
                if (!isInvalidWorkspaceLinkDestination(link.destination)) {
                    continue;
                }

                context.report({
                    data: {
                        destination: link.destination,
                    },
                    loc: {
                        end: context.sourceCode.getLocFromIndex(link.end),
                        start: context.sourceCode.getLocFromIndex(link.start),
                    },
                    messageId: "nonRelativeSkillLink",
                });
            }
        },
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
                "require Codex skill definition files to use relative Markdown links for workspace resources.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-relative-skill-links"),
        },
        messages: {
            nonRelativeSkillLink:
                "Codex skill definition files should reference workspace resources with relative Markdown links, not `{{destination}}`.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-relative-skill-links",
});

export default requireRelativeSkillLinksRule;
