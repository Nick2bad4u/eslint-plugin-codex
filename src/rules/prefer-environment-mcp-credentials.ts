/**
 * @packageDocumentation
 * ESLint rule implementation for `prefer-environment-mcp-credentials`.
 */
import { isDefined, objectEntries } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isCodexTomlFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import {
    createTomlDocumentListener,
    getTomlObject,
    isTomlObject,
    reportTomlDocumentProblem,
} from "../_internal/toml-rule.js";

const SENSITIVE_HEADER_PATTERN =
    /^(?:authorization|proxy-authorization|x-api-key)$/iv;

/** Prefer environment-backed HTTP credentials over committed literals. */
const preferEnvironmentMcpCredentialsRule: CodexRuleModule = createCodexRule({
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
                    continue;
                }

                const headers = getTomlObject(rawServer, "http_headers");

                if (!isDefined(headers)) {
                    continue;
                }

                for (const [headerName, headerValue] of objectEntries(
                    headers
                )) {
                    if (
                        typeof headerValue !== "string" ||
                        !SENSITIVE_HEADER_PATTERN.test(headerName)
                    ) {
                        continue;
                    }

                    reportTomlDocumentProblem(context, {
                        data: {
                            headerName,
                            serverName,
                        },
                        messageId: "literalCredentialHeader",
                    });
                }
            }
        }),
    meta: {
        deprecated: false,
        docs: {
            codexConfigs: ["codex.configs.strict", "codex.configs.all"],
            description:
                "disallow literal sensitive HTTP headers in Codex MCP configuration when environment-backed credentials are available.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("prefer-environment-mcp-credentials"),
        },
        messages: {
            literalCredentialHeader:
                "MCP server `{{serverName}}` stores sensitive header `{{headerName}}` as a literal. Use bearer_token_env_var or env_http_headers so credentials stay outside config.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "prefer-environment-mcp-credentials",
});

export default preferEnvironmentMcpCredentialsRule;
