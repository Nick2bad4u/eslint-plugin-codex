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
    type TomlObject,
} from "../_internal/toml-rule.js";

const VALID_APPROVAL_MODES: ReadonlySet<string> = new Set([
    "approve",
    "auto",
    "prompt",
    "writes",
]);

const isValidApprovalMode = (value: unknown): boolean =>
    typeof value === "string" && setHas(VALID_APPROVAL_MODES, value);

const getInvalidToolApprovalFields = (tools: TomlObject): readonly string[] =>
    objectEntries(tools).flatMap(([toolName, rawTool]) => {
        if (!isTomlObject(rawTool)) {
            return [];
        }

        const toolMode = rawTool["approval_mode"];

        return isDefined(toolMode) && !isValidApprovalMode(toolMode)
            ? [`tools.${toolName}.approval_mode`]
            : [];
    });

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
                const invalidFields = [
                    ...(isDefined(defaultMode) &&
                    !isValidApprovalMode(defaultMode)
                        ? ["default_tools_approval_mode"]
                        : []),
                    ...getInvalidToolApprovalFields(
                        getTomlObject(rawServer, "tools") ?? {}
                    ),
                ];

                for (const field of invalidFields) {
                    reportTomlDocumentProblem(context, {
                        data: {
                            field,
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
        languages: ["js/js"],
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
