import type { Linter } from "eslint";

import { lintCodexFiles } from "./lint-codex-files";

type LintMarkdownRuleInput = Readonly<{
    additionalFiles?: Readonly<Record<string, string>>;
    filePath: string;
    ruleId: string;
    text: string;
}>;

export const lintMarkdownRule = async (
    input: LintMarkdownRuleInput
): Promise<readonly Linter.LintMessage[]> => {
    const [result] = await lintCodexFiles({
        files: {
            ...input.additionalFiles,
            [input.filePath]: input.text,
        },
        ruleId: input.ruleId,
        targetFiles: [input.filePath],
    });

    if (result === undefined) {
        return [];
    }

    return result.messages;
};
