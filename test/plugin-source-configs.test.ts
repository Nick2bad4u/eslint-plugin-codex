import * as jsonPluginModule from "@eslint/json";
import * as markdownPluginModule from "@eslint/markdown";
import { ESLint, type Linter } from "eslint";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import plugin from "../src/plugin";

const jsonPlugin = jsonPluginModule.default as ESLint.Plugin;
const markdownPlugin = markdownPluginModule.default as ESLint.Plugin;

const fixtureFiles = {
    ".agents/skills/review/SKILL.md":
        "---\nname: Review Skill\ndescription: ''\n---\n",
    ".codex/agents/reviewer.toml": "name = 'reviewer'\n",
    ".codex/hooks.json": '{"hooks":{"Unknown":[]}}',
    "AGENTS.md": "<!-- placeholder -->\n",
} as const satisfies Readonly<Record<string, string>>;

const lintFixtureFiles = async (
    overrideConfig: Linter.Config[]
): Promise<readonly Linter.LintMessage[]> => {
    const root = await fs.mkdtemp(
        path.join(os.tmpdir(), "eslint-plugin-codex-configs-")
    );

    try {
        for (const [relativeFilePath, content] of Object.entries(
            fixtureFiles
        )) {
            const absoluteFilePath = path.join(root, relativeFilePath);

            await fs.mkdir(path.dirname(absoluteFilePath), { recursive: true });
            await fs.writeFile(absoluteFilePath, content, "utf8");
        }

        const eslint = new ESLint({
            cwd: root,
            overrideConfig,
            overrideConfigFile: true,
        });
        const results = await eslint.lintFiles(
            Object.keys(fixtureFiles).map((filePath) =>
                path.join(root, filePath)
            )
        );

        return results.flatMap((result) => result.messages);
    } finally {
        await fs.rm(root, { force: true, recursive: true });
    }
};

describe("source plugin config wiring", () => {
    it.each([
        "all",
        "minimal",
        "recommended",
        "strict",
    ] as const)(
        "builds the %s preset as Markdown, TOML, and JSON layers",
        (configName) => {
            expect.hasAssertions();

            const [
                markdownLayer,
                tomlLayer,
                jsonLayer,
            ] = plugin.configs[configName];

            expect(plugin.configs[configName]).toHaveLength(3);
            expect(markdownLayer?.language).toBe("markdown/gfm");
            expect(markdownLayer?.files).toContain("**/AGENTS.md");
            expect(markdownLayer?.files).toContain("**/.agents/skills/**/*.md");
            expect(markdownLayer?.plugins).toHaveProperty("markdown");
            expect(tomlLayer?.files).toContain("**/.codex/config.toml");
            expect(tomlLayer?.files).toContain("**/.codex/agents/*.toml");
            expect(tomlLayer?.languageOptions?.["parser"]).toBeDefined();
            expect(jsonLayer?.language).toBe("json/json");
            expect(jsonLayer?.files).toContain("**/.codex/hooks.json");
            expect(jsonLayer?.plugins).toHaveProperty("json");
        }
    );

    it("keeps each preset cumulative", () => {
        expect.hasAssertions();

        const keys = (
            name:
                | "all"
                | "minimal"
                | "recommended"
                | "strict"
        ) =>
            new Set(
                plugin.configs[name].flatMap((layer) =>
                    Object.keys(layer.rules)
                )
            );
        const minimal = keys("minimal");
        const recommended = keys("recommended");
        const strict = keys("strict");
        const all = keys("all");

        expect(minimal).toStrictEqual(
            new Set([
                "codex/no-empty-agents-md",
                "codex/require-custom-agent-fields",
                "codex/require-skill-frontmatter",
                "codex/require-valid-hook-structure",
            ])
        );
        expect(minimal.isSubsetOf(recommended)).toBe(true);
        expect(recommended.isSubsetOf(strict)).toBe(true);
        expect(strict.isSubsetOf(all)).toBe(true);
    });

    it("self-registers language plugins and lints all supported formats", async () => {
        expect.hasAssertions();

        const messages = await lintFixtureFiles(plugin.configs.recommended);
        const messageIds = messages.map((message) => message.messageId);

        expect(messageIds).toStrictEqual(
            expect.arrayContaining([
                "emptyInstructions",
                "invalidMatcherGroups",
                "invalidSkillName",
                "missingAgentField",
            ])
        );
    });

    it("supports consumers that register language plugins themselves", async () => {
        expect.hasAssertions();

        const config = plugin.configs["recommended-without-language-plugins"];

        for (const layer of config) {
            expect(layer.plugins).toHaveProperty("codex");
            expect(layer.plugins).not.toHaveProperty("json");
            expect(layer.plugins).not.toHaveProperty("markdown");
        }

        const messages = await lintFixtureFiles([
            { plugins: { json: jsonPlugin, markdown: markdownPlugin } },
            ...config,
        ]);

        expect(messages.map((message) => message.messageId)).toContain(
            "emptyInstructions"
        );
    });

    it("does not evaluate non-Codex program ASTs as TOML", async () => {
        expect.hasAssertions();

        const rules = Object.fromEntries(
            Object.keys(plugin.rules).map((ruleName) => [
                `codex/${ruleName}`,
                "error" as const,
            ])
        );
        const eslint = new ESLint({
            overrideConfig: [
                {
                    plugins: { codex: plugin },
                    rules,
                },
            ],
            overrideConfigFile: true,
        });
        const [result] = await eslint.lintText("export const value = 1;\n", {
            filePath: "src/example.js",
        });

        expect(result?.messages).toHaveLength(0);
    });
});
