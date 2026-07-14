import { ESLint } from "eslint";
import fc from "fast-check";
import { describe, expect, it } from "vitest";

import {
    extractFrontmatter,
    hasMeaningfulMarkdownBody,
} from "../src/_internal/frontmatter";
import { parseJsonText } from "../src/_internal/hooks-json";
import { extractMarkdownLinks } from "../src/_internal/markdown-links";
import plugin from "../src/plugin";

const PARSER_FUZZ_PARAMETERS = {
    numRuns: 500,
    seed: 202_239_981,
} as const;
const PRESET_FUZZ_PARAMETERS = {
    numRuns: 75,
    seed: 202_186_327,
} as const;

const arbitraryText = fc.string({ maxLength: 2048 });
const arbitraryJsonText = fc.json({ maxDepth: 6, stringUnit: "binary" });
const eslint = new ESLint({
    overrideConfig: plugin.configs.all,
    overrideConfigFile: true,
});

const assertSuccessfulLint = (result: ESLint.LintResult | undefined): void => {
    expect(result).toBeDefined();
    expect(result?.fatalErrorCount).toBe(0);

    const messages = result?.messages ?? [];

    for (const message of messages) {
        expect(message.ruleId).toMatch(/^codex\//v);
        expect(message.line).toBeGreaterThan(0);
        expect(message.column).toBeGreaterThan(0);
    }
};

describe("parser fuzz properties", () => {
    it("preserves frontmatter body offsets for arbitrary YAML and Markdown", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                arbitraryText,
                arbitraryText,
                fc.constantFrom("\n", "\r\n"),
                (content, body, endOfLine) => {
                    const text = `---${endOfLine}${content}${endOfLine}---${endOfLine}${body}`;
                    const document = extractFrontmatter(text);

                    expect(document).not.toBeNull();
                    expect(document?.offset).toBeGreaterThan(0);
                    expect(document?.offset).toBeLessThanOrEqual(text.length);
                    expect(document?.body).toBe(text.slice(document?.offset));
                    expect(document?.offset ?? 0).toBe(
                        text.length - (document?.body.length ?? 0)
                    );
                    expect(document?.error).toSatisfy(
                        (error: unknown) =>
                            error === undefined || typeof error === "string"
                    );
                }
            ),
            PARSER_FUZZ_PARAMETERS
        );
    });

    it("keeps Markdown body detection and link ranges stable", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                arbitraryText,
                fc.nat({ max: 1_000_000 }),
                (text, offset) => {
                    const links = extractMarkdownLinks(text, offset);

                    expect(hasMeaningfulMarkdownBody(text)).toBeTypeOf(
                        "boolean"
                    );
                    expect(extractMarkdownLinks(text, offset)).toStrictEqual(
                        links
                    );
                    expect(
                        links.every((link, index) => {
                            const previousLink = links[index - 1];

                            return (
                                previousLink === undefined ||
                                link.start >= previousLink.end
                            );
                        })
                    ).toBe(true);

                    for (const link of links) {
                        expect(link.start).toBeGreaterThanOrEqual(offset);
                        expect(link.end).toBeGreaterThan(link.start);
                        expect(link.end).toBeLessThanOrEqual(
                            offset + text.length
                        );
                        expect(link.text).toHaveLength(link.end - link.start);
                        expect(link.rawDestination).not.toMatch(/[\n\r]/v);
                    }
                }
            ),
            PARSER_FUZZ_PARAMETERS
        );
    });

    it("round-trips arbitrary JSON values through the hook parser", () => {
        expect.hasAssertions();

        fc.assert(
            fc.property(
                fc.jsonValue({ maxDepth: 6, stringUnit: "binary" }),
                (value) => {
                    const serialized = JSON.stringify(value);

                    expect(parseJsonText(serialized)).toStrictEqual(
                        JSON.parse(serialized) as unknown
                    );
                }
            ),
            PARSER_FUZZ_PARAMETERS
        );
    });
});

describe("all preset fuzz properties", () => {
    it("lints arbitrary Markdown without plugin or parser failures", async () => {
        expect.hasAssertions();

        await expect(
            fc.assert(
                fc.asyncProperty(arbitraryText, async (text) => {
                    const [result] = await eslint.lintText(text, {
                        filePath: ".agents/skills/fuzz/SKILL.md",
                    });

                    assertSuccessfulLint(result);
                }),
                PRESET_FUZZ_PARAMETERS
            )
        ).resolves.toBeUndefined();
    });

    it("lints arbitrary valid hook JSON without plugin failures", async () => {
        expect.hasAssertions();

        await expect(
            fc.assert(
                fc.asyncProperty(arbitraryJsonText, async (text) => {
                    const [result] = await eslint.lintText(text, {
                        filePath: ".codex/hooks.json",
                    });

                    assertSuccessfulLint(result);
                }),
                PRESET_FUZZ_PARAMETERS
            )
        ).resolves.toBeUndefined();
    });

    it("lints arbitrary valid TOML scalars without plugin failures", async () => {
        expect.hasAssertions();

        const asciiLetter = fc
            .oneof(
                fc.integer({ max: 90, min: 65 }),
                fc.integer({ max: 122, min: 97 })
            )
            .map((codePoint) => String.fromCodePoint(codePoint));
        const asciiDigit = fc
            .integer({ max: 57, min: 48 })
            .map((codePoint) => String.fromCodePoint(codePoint));
        const tomlKeyCharacter = fc.oneof(
            asciiLetter,
            asciiDigit,
            fc.constantFrom("_", "-")
        );
        const tomlStringCharacter = fc.oneof(
            tomlKeyCharacter,
            fc.constantFrom(" ", ".", "/", ":")
        );
        const tomlKey = fc
            .tuple(asciiLetter, fc.array(tomlKeyCharacter, { maxLength: 24 }))
            .map(([firstCharacter, remainingCharacters]) =>
                [firstCharacter, ...remainingCharacters].join("")
            );
        const tomlString = fc
            .array(tomlStringCharacter, { maxLength: 128 })
            .map((characters) => JSON.stringify(characters.join("")));
        const tomlValue = fc.oneof(
            tomlString,
            fc.boolean().map(String),
            fc.integer().map(String)
        );
        const tomlDocument = fc
            .dictionary(tomlKey, tomlValue, { maxKeys: 20 })
            .map((entries) =>
                Object.entries(entries)
                    .map(([key, value]) => `${key} = ${value}`)
                    .join("\n")
            );

        await expect(
            fc.assert(
                fc.asyncProperty(tomlDocument, async (text) => {
                    const [result] = await eslint.lintText(text, {
                        filePath: ".codex/config.toml",
                    });

                    assertSuccessfulLint(result);
                }),
                PRESET_FUZZ_PARAMETERS
            )
        ).resolves.toBeUndefined();
    });
});
