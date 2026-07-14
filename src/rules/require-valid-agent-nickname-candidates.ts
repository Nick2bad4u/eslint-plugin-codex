/**
 * @packageDocumentation
 * ESLint rule implementation for `require-valid-agent-nickname-candidates`.
 */
import { isDefined, isEmpty } from "ts-extras";

import type { CodexRuleModule } from "../_internal/create-codex-rule.js";

import { isCustomAgentFilePath } from "../_internal/codex-file-kind.js";
import { createCodexRule } from "../_internal/create-codex-rule.js";
import { createRuleDocsUrl } from "../_internal/rule-docs-url.js";
import {
    createTomlDocumentListener,
    getTomlArray,
    reportTomlDocumentProblem,
} from "../_internal/toml-rule.js";

const isValidNicknameCharacter = (character: string): boolean => {
    const codePoint = character.codePointAt(0) ?? 0;

    return (
        character === " " ||
        character === "-" ||
        character === "_" ||
        (codePoint >= 48 && codePoint <= 57) ||
        (codePoint >= 65 && codePoint <= 90) ||
        (codePoint >= 97 && codePoint <= 122)
    );
};

const isValidNickname = (value: string): boolean => {
    if (value.length === 0) {
        return false;
    }

    for (const character of value) {
        if (!isValidNicknameCharacter(character)) {
            return false;
        }
    }

    return true;
};

/** Validate the optional custom-agent nickname pool. */
const requireValidAgentNicknameCandidatesRule: CodexRuleModule =
    createCodexRule({
        create: (context) =>
            createTomlDocumentListener(context, (document) => {
                if (!isCustomAgentFilePath(context.filename)) {
                    return;
                }

                const rawValue = document["nickname_candidates"];

                if (!isDefined(rawValue)) {
                    return;
                }

                const candidates = getTomlArray(
                    document,
                    "nickname_candidates"
                );

                if (
                    !isDefined(candidates) ||
                    isEmpty(candidates) ||
                    candidates.some(
                        (candidate) =>
                            typeof candidate !== "string" ||
                            !isValidNickname(candidate)
                    )
                ) {
                    reportTomlDocumentProblem(context, {
                        messageId: "invalidNicknameCandidates",
                    });
                    return;
                }

                const uniqueCandidates = new Set(candidates);

                if (uniqueCandidates.size !== candidates.length) {
                    reportTomlDocumentProblem(context, {
                        messageId: "duplicateNicknameCandidates",
                    });
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
                    "require custom-agent nickname_candidates to be a non-empty array of unique supported names.",
                frozen: false,
                recommended: true,
                requiresTypeChecking: false,
                url: createRuleDocsUrl(
                    "require-valid-agent-nickname-candidates"
                ),
            },
            messages: {
                duplicateNicknameCandidates:
                    "Codex custom-agent nickname candidates must be unique.",
                invalidNicknameCandidates:
                    "nickname_candidates must be a non-empty string array using only ASCII letters, digits, spaces, hyphens, and underscores.",
            },
            schema: [],
            type: "problem",
        },
        name: "require-valid-agent-nickname-candidates",
    });

export default requireValidAgentNicknameCandidatesRule;
