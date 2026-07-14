import { describe, expect, it } from "vitest";

import { lintCodexFiles } from "./_internal/lint-codex-files";
import { lintMarkdownRule } from "./_internal/lint-markdown-file";

const lintSkill = async (
    ruleId: string,
    text: string,
    filePath = ".agents/skills/review/SKILL.md"
) =>
    lintMarkdownRule({
        filePath,
        ruleId,
        text,
    });

const validSkill =
    "---\nname: review\ndescription: Review code carefully.\n---\n\nFollow the repository review checklist.\n";

describe("skill rules", () => {
    it.each([
        [
            "no-empty-skill-body",
            "---\nname: review\ndescription: Review code.\n---\n",
            "emptySkillBody",
        ],
        [
            "require-skill-frontmatter",
            "Review code.\n",
            "missingFrontmatter",
        ],
        [
            "require-skill-frontmatter",
            "---\nname: review\n---\nReview code.\n",
            "missingDescription",
        ],
        [
            "require-valid-skill-name",
            "---\nname: Review Skill\ndescription: Review code.\n---\nReview.\n",
            "invalidSkillName",
        ],
        [
            "require-valid-skill-description",
            "---\nname: review\ndescription: ''\n---\nReview.\n",
            "invalidDescription",
        ],
        [
            "require-valid-skill-compatibility",
            `---\nname: review\ndescription: Review code.\ncompatibility: ${"x".repeat(501)}\n---\nReview.\n`,
            "invalidCompatibility",
        ],
        [
            "require-valid-skill-license",
            "---\nname: review\ndescription: Review code.\nlicense: ''\n---\nReview.\n",
            "invalidSkillLicense",
        ],
        [
            "require-relative-skill-links",
            "---\nname: review\ndescription: Review code.\n---\nSee [guide](/docs/review.md).\n",
            "nonRelativeSkillLink",
        ],
        [
            "require-existing-relative-skill-links",
            "---\nname: review\ndescription: Review code.\n---\nSee [guide](missing.md).\n",
            "missingSkillLinkTarget",
        ],
    ])("%s reports %s", async (ruleId, text, messageId) => {
        expect.hasAssertions();

        const messages = await lintSkill(ruleId, text);

        expect(messages.map((message) => message.messageId)).toContain(
            messageId
        );
    });

    it.each([
        [
            "require-skill-location",
            "docs/review/SKILL.md",
            "invalidSkillLocation",
        ],
        [
            "require-skill-md-filename",
            ".agents/skills/review/README.md",
            "invalidSkillDefinitionFilename",
        ],
        [
            "require-valid-skill-directory-name",
            ".agents/skills/Review Skill/SKILL.md",
            "invalidSkillDirectoryName",
        ],
        [
            "require-skill-name-match-directory",
            ".agents/skills/security/SKILL.md",
            "skillNameDoesNotMatchDirectory",
        ],
    ])("%s validates the skill path", async (ruleId, filePath, messageId) => {
        expect.hasAssertions();

        const messages = await lintSkill(ruleId, validSkill, filePath);

        expect(messages.map((message) => message.messageId)).toContain(
            messageId
        );
    });

    it("accepts a conforming skill", async () => {
        expect.hasAssertions();

        for (const ruleId of [
            "no-empty-skill-body",
            "require-skill-frontmatter",
            "require-valid-skill-name",
            "require-valid-skill-description",
            "require-valid-skill-directory-name",
            "require-skill-name-match-directory",
        ]) {
            await expect(lintSkill(ruleId, validSkill)).resolves.toHaveLength(
                0
            );
        }
    });

    it("reports duplicate names across project skill directories", async () => {
        expect.hasAssertions();

        const files = {
            ".agents/skills/review/SKILL.md": validSkill,
            "skills/review-copy/SKILL.md": validSkill,
        };
        const results = await lintCodexFiles({
            files,
            ruleId: "no-duplicate-skill-names",
            targetFiles: [".agents/skills/review/SKILL.md"],
        });

        expect(
            results[0]?.messages.map((message) => message.messageId)
        ).toStrictEqual(["duplicateSkillName"]);
    });
});
