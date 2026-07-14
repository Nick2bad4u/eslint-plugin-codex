import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isSkillFilePath } from "../_internal/codex-file-kind.js";
/**
 * @packageDocumentation
 * ESLint rule implementation for `require-existing-relative-skill-links`.
 */
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { getCustomizationBodyWithOffset } from "../_internal/customization-body.js";
import { pathExists } from "../_internal/file-system.js";
import {
    extractMarkdownLinks,
    isRelativeWorkspaceLinkDestination,
    resolveMarkdownWorkspaceLink,
} from "../_internal/markdown-links.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

/** Rule module for `require-existing-relative-skill-links`. */
const requireExistingRelativeSkillLinksRule: CodexRuleModule = createCodexRule({
    create: (context) => ({
        root() {
            if (!isSkillFilePath(context.filename)) {
                return;
            }

            const { body, offset } = getCustomizationBodyWithOffset(
                context.sourceCode.text
            );

            for (const link of extractMarkdownLinks(body, offset)) {
                if (!isRelativeWorkspaceLinkDestination(link.destination)) {
                    continue;
                }

                if (
                    pathExists(
                        resolveMarkdownWorkspaceLink(
                            context.filename,
                            link.destination
                        )
                    )
                ) {
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
                    messageId: "missingSkillLinkTarget",
                });
            }
        },
    }),
    meta: {
        deprecated: false,
        docs: {
            codexConfigs: ["codex.configs.strict", "codex.configs.all"],
            description:
                "require relative Markdown links in Codex skill definition files to resolve to existing workspace resources.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-existing-relative-skill-links"),
        },
        messages: {
            missingSkillLinkTarget:
                "Codex skill relative link `{{destination}}` does not resolve to an existing workspace path.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-existing-relative-skill-links",
});

export default requireExistingRelativeSkillLinksRule;
