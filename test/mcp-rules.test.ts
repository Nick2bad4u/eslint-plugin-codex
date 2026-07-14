import { describe, expect, it } from "vitest";

import { lintCodexFiles } from "./_internal/lint-codex-files";

const messagesFor = async (ruleId: string, text: string) => {
    const results = await lintCodexFiles({
        files: { ".codex/config.toml": text },
        ruleId,
    });

    return results[0]?.messages.map((message) => message.messageId) ?? [];
};

describe("mcp configuration rules", () => {
    it.each([
        [
            "no-conflicting-mcp-tool-lists",
            "[mcp_servers.docs]\ncommand = 'server'\nenabled_tools = ['read']\ndisabled_tools = ['read']\n",
            "conflictingToolLists",
        ],
        [
            "prefer-environment-mcp-credentials",
            "[mcp_servers.docs]\nurl = 'https://example.com/mcp'\n[mcp_servers.docs.http_headers]\nAuthorization = 'Bearer secret'\n",
            "literalCredentialHeader",
        ],
        [
            "require-valid-mcp-approval-mode",
            "[mcp_servers.docs]\ncommand = 'server'\ndefault_tools_approval_mode = 'always'\n",
            "invalidApprovalMode",
        ],
        [
            "require-valid-mcp-transport",
            "[mcp_servers.docs]\nenabled = true\n",
            "missingTransport",
        ],
        [
            "require-valid-mcp-transport",
            "[mcp_servers.docs]\nurl = 'ftp://example.com'\n",
            "invalidHttpUrl",
        ],
    ])(
        "%s reports invalid MCP configuration",
        async (ruleId, text, messageId) => {
            expect.hasAssertions();

            await expect(messagesFor(ruleId, text)).resolves.toContain(
                messageId
            );
        }
    );

    it("accepts a usable environment-backed HTTP server", async () => {
        expect.hasAssertions();

        const text =
            "[mcp_servers.docs]\nurl = 'https://example.com/mcp'\nbearer_token_env_var = 'DOCS_TOKEN'\ndefault_tools_approval_mode = 'prompt'\n";

        for (const ruleId of [
            "prefer-environment-mcp-credentials",
            "require-valid-mcp-approval-mode",
            "require-valid-mcp-transport",
        ]) {
            await expect(messagesFor(ruleId, text)).resolves.toHaveLength(0);
        }
    });
});
