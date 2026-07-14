import * as jsonModule from "@eslint/json";
import * as markdownModule from "@eslint/markdown";
import { ESLint, type Linter } from "eslint";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import * as tomlParserModule from "toml-eslint-parser";

import plugin from "../../src/plugin";

export type CodexFixtureFileMap = Readonly<Record<string, string>>;

export type LintCodexFileResult = Readonly<{
    filePath: string;
    messages: readonly Linter.LintMessage[];
}>;

export type LintCodexFilesInput = Readonly<{
    files: CodexFixtureFileMap;
    ruleId: string;
    targetFiles?: readonly string[];
}>;

const codexEslintPlugin = plugin as ESLint.Plugin;
const markdownPlugin = markdownModule.default as unknown as ESLint.Plugin;
const jsonPlugin = jsonModule.default as unknown as ESLint.Plugin;

const writeFixtureFile = async (
    rootDirectoryPath: string,
    relativeFilePath: string,
    content: string
): Promise<void> => {
    const absoluteFilePath = path.join(rootDirectoryPath, relativeFilePath);

    await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
    await fs.writeFile(absoluteFilePath, content, "utf8");
};

const createLintConfig = (ruleId: string): Linter.Config[] => [
    {
        files: ["**/*.md"],
        language: "markdown/gfm",
        plugins: {
            codex: codexEslintPlugin,
            markdown: markdownPlugin,
        },
        rules: {
            [`codex/${ruleId}`]: "error",
        },
    },
    {
        files: ["**/*.toml"],
        languageOptions: {
            parser: tomlParserModule,
            parserOptions: {
                tomlVersion: "1.0.0",
            },
        },
        plugins: {
            codex: codexEslintPlugin,
        },
        rules: {
            [`codex/${ruleId}`]: "error",
        },
    },
    {
        files: ["**/*.json"],
        language: "json/json",
        plugins: {
            codex: codexEslintPlugin,
            json: jsonPlugin,
        },
        rules: {
            [`codex/${ruleId}`]: "error",
        },
    },
];

export const lintCodexFiles = async (
    input: LintCodexFilesInput
): Promise<readonly LintCodexFileResult[]> => {
    const temporaryRoot = await fs.mkdtemp(
        path.join(os.tmpdir(), "eslint-plugin-codex-")
    );

    try {
        await writeFixtureFile(
            temporaryRoot,
            "package.json",
            JSON.stringify({ name: "fixture-repo", private: true }, null, 2)
        );

        for (const [relativePath, content] of Object.entries(input.files)) {
            await writeFixtureFile(temporaryRoot, relativePath, content);
        }

        const eslint = new ESLint({
            cwd: temporaryRoot,
            overrideConfig: createLintConfig(input.ruleId),
            overrideConfigFile: true,
        });
        const lintTargets = (input.targetFiles ?? Object.keys(input.files)).map(
            (relativePath) => path.join(temporaryRoot, relativePath)
        );
        const results = await eslint.lintFiles(lintTargets);

        return results.map((result) => ({
            filePath: path
                .relative(temporaryRoot, result.filePath)
                .replaceAll("\\", "/"),
            messages: result.messages,
        }));
    } finally {
        await fs.rm(temporaryRoot, { force: true, recursive: true });
    }
};
