/**
 * @packageDocumentation
 * ESLint rule implementation for `no-duplicate-skill-names`.
 */
import path from "node:path";
import { arrayJoin, isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import {
    getSkillName,
    normalizeNameForComparison,
} from "../_internal/codex-customization-names.js";
import {
    findRepositoryRoot,
    isSkillFilePath,
} from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { collectDuplicateNameGroups } from "../_internal/duplicate-names.js";
import {
    listFilesRecursively,
    readUtf8File,
} from "../_internal/file-system.js";
import { extractFrontmatter } from "../_internal/frontmatter.js";
import {
    createMarkdownDocumentListener,
    reportAtDocumentStart,
} from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

const normalizeRelativeFilePath = (
    repositoryRoot: string,
    filePath: string
): string => path.relative(repositoryRoot, filePath).replaceAll("\\", "/");

/** Rule module for `no-duplicate-skill-names`. */
const noDuplicateSkillNamesRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createMarkdownDocumentListener(() => {
            if (!isSkillFilePath(context.filename)) {
                return;
            }

            const repositoryRoot = findRepositoryRoot(context.filename);
            const skillFiles = [
                ...listFilesRecursively(
                    path.join(repositoryRoot, ".agents", "skills"),
                    (filePath) => path.basename(filePath) === "SKILL.md"
                ),
                ...listFilesRecursively(
                    path.join(repositoryRoot, "skills"),
                    (filePath) => path.basename(filePath) === "SKILL.md"
                ),
            ];
            const duplicateGroups = collectDuplicateNameGroups(
                skillFiles.map((filePath) => {
                    const sourceText =
                        context.filename === filePath
                            ? context.sourceCode.text
                            : readUtf8File(filePath);

                    return {
                        filePath,
                        name: getSkillName(
                            filePath,
                            extractFrontmatter(sourceText)
                        ),
                    };
                }),
                normalizeNameForComparison
            );
            const currentSkillName = getSkillName(
                context.filename,
                extractFrontmatter(context.sourceCode.text)
            );
            const duplicateGroup = duplicateGroups.get(
                normalizeNameForComparison(currentSkillName)
            );

            if (!isDefined(duplicateGroup)) {
                return;
            }

            reportAtDocumentStart(context, {
                data: {
                    files: arrayJoin(
                        duplicateGroup.map((entry) =>
                            normalizeRelativeFilePath(
                                repositoryRoot,
                                entry.filePath
                            )
                        ),
                        ", "
                    ),
                    name: currentSkillName,
                },
                messageId: "duplicateSkillName",
            });
        }),
    meta: {
        deprecated: false,
        docs: {
            codexConfigs: ["codex.configs.strict", "codex.configs.all"],
            description:
                "disallow duplicate effective skill names across project skill definition files.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-duplicate-skill-names"),
        },
        messages: {
            duplicateSkillName:
                "Skill name `{{name}}` appears more than once: {{files}}. Codex lists duplicate names separately, which can make selection ambiguous.",
        },
        schema: [],
        type: "problem",
    },
    name: "no-duplicate-skill-names",
});

export default noDuplicateSkillNamesRule;
