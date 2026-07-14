import { describe, expect, it } from "vitest";

import { lintCodexFiles } from "./_internal/lint-codex-files";
import { lintMarkdownRule } from "./_internal/lint-markdown-file";

const messageIdsFor = async (
    ruleId: string,
    filePath: string,
    text: string,
    files: Readonly<Record<string, string>> = {}
): Promise<readonly (string | undefined)[]> => {
    const results = await lintCodexFiles({
        files: { ...files, [filePath]: text },
        ruleId,
        targetFiles: [filePath],
    });

    return results[0]?.messages.map((message) => message.messageId) ?? [];
};

describe("codex config and custom-agent rules", () => {
    it.each([
        [
            "no-deprecated-config-features",
            "[features]\ncodex_hooks = true\n",
            "deprecatedFeature",
        ],
        [
            "no-full-access-without-approval",
            "sandbox_mode = 'danger-full-access'\napproval_policy = 'never'\n",
            "unboundedExecution",
        ],
        [
            "no-ignored-project-config-keys",
            "notify = ['pwsh', '-File', 'notify.ps1']\n",
            "ignoredProjectConfigKey",
        ],
        [
            "no-legacy-profile-config",
            "profile = 'review'\n",
            "legacyProfileConfig",
        ],
        [
            "no-mixed-permission-models",
            "default_permissions = 'workspace'\nsandbox_mode = 'workspace-write'\n",
            "mixedPermissionModels",
        ],
    ])(
        "%s reports unsafe or ineffective project config",
        async (ruleId, text, messageId) => {
            expect.hasAssertions();

            await expect(
                messageIdsFor(ruleId, ".codex/config.toml", text)
            ).resolves.toContain(messageId);
        }
    );

    it("requires all standalone custom-agent fields", async () => {
        expect.hasAssertions();

        await expect(
            messageIdsFor(
                "require-custom-agent-fields",
                ".codex/agents/reviewer.toml",
                "name = 'reviewer'\n"
            )
        ).resolves.toStrictEqual(["missingAgentField", "missingAgentField"]);
    });

    it.each([
        ["nickname_candidates = []\n", "invalidNicknameCandidates"],
        [
            "nickname_candidates = ['Scout', 'Scout']\n",
            "duplicateNicknameCandidates",
        ],
        ["nickname_candidates = ['bad!']\n", "invalidNicknameCandidates"],
    ])(
        "validates custom-agent nickname candidates",
        async (extra, messageId) => {
            expect.hasAssertions();

            const text = `name = 'reviewer'\ndescription = 'Reviews code'\ndeveloper_instructions = 'Review carefully'\n${
                extra
            }`;

            await expect(
                messageIdsFor(
                    "require-valid-agent-nickname-candidates",
                    ".codex/agents/reviewer.toml",
                    text
                )
            ).resolves.toContain(messageId);
        }
    );

    it("reports deprecated custom prompt files", async () => {
        expect.hasAssertions();

        const messages = await lintMarkdownRule({
            filePath: ".codex/prompts/review.md",
            ruleId: "no-deprecated-custom-prompts",
            text: "Review this repository.\n",
        });

        expect(messages.map((message) => message.messageId)).toStrictEqual([
            "deprecatedCustomPrompt",
        ]);
    });

    it("counts the complete active AGENTS instruction chain in UTF-8 bytes", async () => {
        expect.hasAssertions();

        const largeRootInstructions = `# Root\n\n${"é".repeat(16_400)}\n`;

        await expect(
            messageIdsFor(
                "max-agents-instruction-chain-bytes",
                "packages/app/AGENTS.md",
                "# App\n\nUse the local test command.\n",
                { "AGENTS.md": largeRootInstructions }
            )
        ).resolves.toContain("instructionChainTooLarge");
    });
});
