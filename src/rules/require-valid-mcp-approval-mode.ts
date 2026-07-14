/**
 * @packageDocumentation
 * ESLint rule implementation for `require-valid-mcp-approval-mode`.
 */
import { isDefined, objectEntries, setHas } from "ts-extras";

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

const VALID_APPROVAL_MODES: ReadonlySet<string> = new Set([
    "approve",
    "auto",
    "prompt",
    "writes",
]);

const isValidApprovalMode = (value: unknown): boolean =>
    typeof value === "string" && setHas(VALID_APPROVAL_MODES, value);

/** Validate MCP server and per-tool approval modes. */
const requireValidMcpApprovalModeRule: CodexRuleModule = createCodexRule({
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

                const defaultMode = rawServer["default_tools_approval_mode"];

                if (
                    isDefined(defaultMode) &&
                    !isValidApprovalMode(defaultMode)
                ) {
                    reportTomlDocumentProblem(context, {
                        data: {
                            field: "default_tools_approval_mode",
                            serverName,
                        },
                        messageId: "invalidApprovalMode",
                    });
                }

                const tools = getTomlObject(rawServer, "tools");

                if (!isDefined(tools)) {
                    continue;
                }

                for (const [toolName, rawTool] of objectEntries(tools)) {
                    if (!isTomlObject(rawTool)) {
                        continue;
                    }

                    const toolMode = rawTool["approval_mode"];

                    if (!isDefined(toolMode) || isValidApprovalMode(toolMode)) {
                        continue;
                    }

                    reportTomlDocumentProblem(context, {
                        data: {
                            field: `tools.${toolName}.approval_mode`,
                            serverName,
                        },
                        messageId: "invalidApprovalMode",
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
                "require Codex MCP approval modes to use a supported value.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("require-valid-mcp-approval-mode"),
        },
        messages: {
            invalidApprovalMode:
                "MCP server `{{serverName}}` has an unsupported {{field}}. Use auto, prompt, writes, or approve.",
        },
        schema: [],
        type: "problem",
    },
    name: "require-valid-mcp-approval-mode",
});

export default requireValidMcpApprovalModeRule;
