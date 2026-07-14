/**
 * @packageDocumentation
 * ESLint rule implementation for `max-agents-instruction-chain-bytes`.
 */
import { isDefined } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import {
    getActiveInstructionChain,
    isCurrentInstructionFile,
} from "../_internal/agents-instructions.js";
import {
    findRepositoryRoot,
    isAgentsFilePath,
} from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import {
    createMarkdownDocumentListener,
    reportAtDocumentStart,
} from "../_internal/markdown-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";

type Options = readonly [
    Readonly<{
        fallbackFilenames?: readonly string[];
        maxBytes?: number;
    }>,
];

const DEFAULT_OPTIONS: Options = [
    {
        fallbackFilenames: [],
        maxBytes: 32_768,
    },
];

/** Enforce Codex's combined project-instruction byte budget. */
const maxAgentsInstructionChainBytesRule: CodexRuleModule = createCodexRule<
    Options,
    "instructionChainTooLarge"
>({
    create: (context, [options]) =>
        createMarkdownDocumentListener(() => {
            if (!isAgentsFilePath(context.filename)) {
                return;
            }

            const maxBytes = options.maxBytes ?? 32_768;
            const chain = getActiveInstructionChain(
                findRepositoryRoot(context.filename),
                context.filename,
                context.sourceCode.text,
                options.fallbackFilenames ?? []
            );
            const currentEntry = chain.find((entry) =>
                isCurrentInstructionFile(entry, context.filename)
            );

            if (
                !isDefined(currentEntry) ||
                currentEntry.cumulativeBytes <= maxBytes
            ) {
                return;
            }

            reportAtDocumentStart(context, {
                data: {
                    actualBytes: String(currentEntry.cumulativeBytes),
                    maxBytes: String(maxBytes),
                },
                messageId: "instructionChainTooLarge",
            });
        }),
    defaultOptions: DEFAULT_OPTIONS,
    meta: {
        defaultOptions: [
            {
                fallbackFilenames: [],
                maxBytes: 32_768,
            },
        ],
        deprecated: false,
        docs: {
            codexConfigs: [
                "codex.configs.recommended",
                "codex.configs.strict",
                "codex.configs.all",
            ],
            description:
                "enforce a maximum cumulative UTF-8 byte size for active Codex project instructions.",
            frozen: false,
            recommended: true,
            requiresTypeChecking: false,
            url: createRuleDocsUrl("max-agents-instruction-chain-bytes"),
        },
        messages: {
            instructionChainTooLarge:
                "The active Codex instruction chain is {{actualBytes}} bytes, exceeding the {{maxBytes}}-byte limit. Split or shorten the guidance, or align this rule's maxBytes option with project_doc_max_bytes.",
        },
        schema: [
            {
                additionalProperties: false,
                properties: {
                    fallbackFilenames: {
                        description:
                            "Additional basename-only project instruction files to include in the active chain.",
                        items: {
                            description:
                                "A project instruction filename without path separators.",
                            minLength: 1,
                            // eslint-disable-next-line etc-misc/no-unnecessary-template-literal -- String.raw keeps the JSON Schema regex backslash unambiguous.
                            pattern: String.raw`^[^/\\]+$`,
                            type: "string",
                        },
                        type: "array",
                        uniqueItems: true,
                    },
                    maxBytes: {
                        description:
                            "Maximum cumulative UTF-8 byte size of the active instruction chain.",
                        minimum: 1,
                        type: "integer",
                    },
                },
                type: "object",
            },
        ],
        type: "suggestion",
    },
    name: "max-agents-instruction-chain-bytes",
});

export default maxAgentsInstructionChainBytesRule;
