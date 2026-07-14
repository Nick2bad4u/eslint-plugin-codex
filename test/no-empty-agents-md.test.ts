import { describe, expect, it } from "vitest";

import { lintMarkdownRule } from "./_internal/lint-markdown-file";

describe("no-empty-agents-md", () => {
    it.each(["AGENTS.md", "packages/api/AGENTS.override.md"])(
        "accepts meaningful instructions in %s",
        async (filePath) => {
            expect.hasAssertions();

            const messages = await lintMarkdownRule({
                filePath,
                ruleId: "no-empty-agents-md",
                text: "# Repository guidance\n\nRun tests before proposing changes.\n",
            });

            expect(messages).toHaveLength(0);
        }
    );

    it.each([
        "",
        "   \n",
        "<!-- placeholder -->\n",
    ])("reports empty instruction content %#", async (text) => {
        expect.hasAssertions();

        const messages = await lintMarkdownRule({
            filePath: "AGENTS.md",
            ruleId: "no-empty-agents-md",
            text,
        });

        expect(messages.map((message) => message.messageId)).toStrictEqual([
            "emptyInstructions",
        ]);
    });

    it("ignores ordinary markdown files", async () => {
        expect.hasAssertions();

        const messages = await lintMarkdownRule({
            filePath: "README.md",
            ruleId: "no-empty-agents-md",
            text: "",
        });

        expect(messages).toHaveLength(0);
    });
});
