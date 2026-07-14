import { describe, expect, it } from "vitest";

import { lintCodexFiles } from "./_internal/lint-codex-files";

const messageIdsFor = async (
    ruleId: string,
    filePath: string,
    text: string,
    files: Readonly<Record<string, string>> = {}
) => {
    const results = await lintCodexFiles({
        files: { ...files, [filePath]: text },
        ruleId,
        targetFiles: [filePath],
    });

    return results[0]?.messages.map((message) => message.messageId) ?? [];
};

describe("hook rules", () => {
    it.each([
        [
            "require-valid-hook-structure",
            '{"version":1}',
            "missingHooksObject",
        ],
        [
            "require-valid-hook-structure",
            '{"hooks":{"PreToolUse":[]}}',
            "invalidMatcherGroups",
        ],
        [
            "require-valid-hook-events",
            '{"hooks":{"BeforeEverything":[]}}',
            "invalidHookEvent",
        ],
        [
            "no-ignored-hook-matcher",
            '{"hooks":{"Stop":[{"matcher":"x","hooks":[{"type":"command","command":"echo ok"}]}]}}',
            "ignoredMatcher",
        ],
        [
            "no-unsupported-hook-handler",
            '{"hooks":{"PreToolUse":[{"hooks":[{"type":"agent","prompt":"review"}]}]}}',
            "unsupportedHandlerType",
        ],
        [
            "no-unsupported-hook-handler",
            '{"hooks":{"PreToolUse":[{"hooks":[{"type":"command","command":"echo ok","async":true}]}]}}',
            "unsupportedAsyncHandler",
        ],
    ])("%s validates hooks.json", async (ruleId, text, messageId) => {
        expect.hasAssertions();

        await expect(
            messageIdsFor(ruleId, ".codex/hooks.json", text)
        ).resolves.toContain(messageId);
    });

    it.each([
        [
            "require-valid-hook-events",
            "[hooks]\nBeforeEverything = []\n",
            "invalidHookEvent",
        ],
        [
            "no-ignored-hook-matcher",
            "[[hooks.Stop]]\nmatcher = 'x'\n[[hooks.Stop.hooks]]\ntype = 'command'\ncommand = 'echo ok'\n",
            "ignoredMatcher",
        ],
        [
            "no-unsupported-hook-handler",
            "[[hooks.PreToolUse]]\n[[hooks.PreToolUse.hooks]]\ntype = 'command'\ncommand = 'echo ok'\nasync = true\n",
            "unsupportedAsyncHandler",
        ],
    ])(
        "%s also validates inline TOML hooks",
        async (ruleId, text, messageId) => {
            expect.hasAssertions();

            await expect(
                messageIdsFor(ruleId, ".codex/config.toml", text)
            ).resolves.toContain(messageId);
        }
    );

    it("reports JSON and inline TOML hook representations in one layer", async () => {
        expect.hasAssertions();

        await expect(
            messageIdsFor(
                "no-mixed-hook-representations",
                ".codex/config.toml",
                "[hooks]\nPreToolUse = []\n",
                { ".codex/hooks.json": '{"hooks":{}}' }
            )
        ).resolves.toContain("mixedHookRepresentations");
    });

    it("accepts a valid command hook in both representations", async () => {
        expect.hasAssertions();

        const json =
            '{"hooks":{"PreToolUse":[{"matcher":"shell","hooks":[{"type":"command","command":"echo ok"}]}]}}';
        const toml =
            "[[hooks.PreToolUse]]\nmatcher = 'shell'\n[[hooks.PreToolUse.hooks]]\ntype = 'command'\ncommand = 'echo ok'\n";

        for (const ruleId of [
            "require-valid-hook-events",
            "require-valid-hook-structure",
            "no-ignored-hook-matcher",
            "no-unsupported-hook-handler",
        ]) {
            await expect(
                messageIdsFor(ruleId, ".codex/hooks.json", json)
            ).resolves.toHaveLength(0);
            await expect(
                messageIdsFor(ruleId, ".codex/config.toml", toml)
            ).resolves.toHaveLength(0);
        }
    });
});
