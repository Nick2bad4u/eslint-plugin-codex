/**
 * @packageDocumentation
 * ESLint rule implementation for `require-valid-mcp-transport`.
 */
import { isDefined, objectEntries } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isCodexTomlFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import {
    createTomlDocumentListener,
    getTomlObject,
    getTomlString,
    isTomlObject,
    reportTomlDocumentProblem,
} from "../_internal/toml-rule.js";

const isHttpUrl = (value: string): boolean => {
    try {
        const url = new URL(value);

        return url.protocol === "http:" || url.protocol === "https:";
    } catch {
        return false;
    }
};

/** Require usable STDIO or streamable-HTTP fields for MCP servers. */
const requireValidMcpTransportRule: CodexRuleModule = createCodexRule({
    create: (context) =>
        createTomlDocumentListener(context, (document) => {
            if (!isCodexTomlFilePath(context.filename)) {
                return;
            }

            const servers = getTomlObject(document, "mcp_servers");

            if (!isDefined(servers)) {
                return;
            }

            for (const [serverName, rawServer] of objectEntries(servers)) {
                if (!isTomlObject(rawServer)) {
                    reportTomlDocumentProblem(context, {
                        data: {
                            serverName,
                        },
                        messageId: "invalidServerTable",
                    });
                    continue;
                }

                const command = getTomlString(rawServer, "command");
                const url = getTomlString(rawServer, "url");

                if (!isDefined(command) && !isDefined(url)) {
                    reportTomlDocumentProblem(context, {
                        data: {
                            serverName,
                        },
                        messageId: "missingTransport",
                    });
                    continue;
                }

                if (isDefined(url) && !isHttpUrl(url)) {
                    reportTomlDocumentProblem(context, {
                        data: {
                            serverName,
                            url,
                        },
                        messageId: "invalidHttpUrl",
                    });
                }
            }
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
                "require Codex MCP servers to declare a usable STDIO command or streamable HTTP URL.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-valid-mcp-transport"),
        },
        messages: {
            invalidHttpUrl:
                "MCP server `{{serverName}}` has an invalid HTTP URL: `{{url}}`.",
            invalidServerTable:
                "MCP server `{{serverName}}` must be configured as a TOML table.",
            missingTransport:
                "MCP server `{{serverName}}` must declare a non-empty command for STDIO or a URL for streamable HTTP.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-valid-mcp-transport",
});

export default requireValidMcpTransportRule;
