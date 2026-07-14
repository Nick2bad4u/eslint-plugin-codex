import type { UnknownArray } from "type-fest";

/**
 * @packageDocumentation
 * ESLint rule implementation for `no-conflicting-mcp-tool-lists`.
 */
import {
    arrayJoin,
    isDefined,
    isEmpty,
    objectEntries,
    setHas,
} from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isCodexTomlFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import {
    createTomlDocumentListener,
    getTomlArray,
    getTomlObject,
    isTomlObject,
    reportTomlDocumentProblem,
} from "../_internal/toml-rule.js";

const getStringSet = (
    values: Readonly<UnknownArray> | undefined
): ReadonlySet<string> =>
    new Set(
        values?.filter((value): value is string => typeof value === "string")
    );

/** Warn when MCP allow and deny lists overlap. */
const noConflictingMcpToolListsRule: CodexRuleModule = createCodexRule({
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

                const enabledTools = getStringSet(
                    getTomlArray(rawServer, "enabled_tools")
                );
                const disabledTools = getStringSet(
                    getTomlArray(rawServer, "disabled_tools")
                );
                const conflicts = [...enabledTools]
                    .filter((tool) => setHas(disabledTools, tool))
                    .toSorted((left, right) => left.localeCompare(right));

                if (isEmpty(conflicts)) {
                    continue;
                }

                reportTomlDocumentProblem(context, {
                    data: {
                        serverName,
                        tools: arrayJoin(conflicts, ", "),
                    },
                    messageId: "conflictingToolLists",
                });
            }
        }),
    meta: {
        deprecated: false,
        docs: {
            codexConfigs: ["codex.configs.strict", "codex.configs.all"],
            description:
                "disallow overlapping enabled_tools and disabled_tools lists for a Codex MCP server.",
            frozen: false,
            recommended: false,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("no-conflicting-mcp-tool-lists"),
        },
        messages: {
            conflictingToolLists:
                "MCP server `{{serverName}}` enables and disables the same tools: {{tools}}. Codex applies the deny list after the allow list.",
        },
        schema: [],
        type: "suggestion",
    },
    name: "no-conflicting-mcp-tool-lists",
});

export default noConflictingMcpToolListsRule;
