import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

import { orderedRuleNames } from "../src/_internal/rule-catalog";
import plugin from "../src/plugin";

const requireFromTestModule = createRequire(import.meta.url);
const packageJson = requireFromTestModule("../package.json") as {
    version: string;
};

describe("plugin entry module", () => {
    it("exports the complete, stable public contract", () => {
        expect.hasAssertions();

        expect(plugin.meta).toStrictEqual({
            name: "@typpi/eslint-plugin-codex",
            namespace: "codex",
            version: packageJson.version,
        });
        expect(
            Object.keys(plugin.configs).toSorted((left, right) =>
                left.localeCompare(right)
            )
        ).toStrictEqual([
            "all",
            "all-without-language-plugins",
            "minimal",
            "minimal-without-language-plugins",
            "recommended",
            "recommended-without-language-plugins",
            "strict",
            "strict-without-language-plugins",
        ]);
        expect(
            Object.keys(plugin.rules).toSorted((left, right) =>
                left.localeCompare(right)
            )
        ).toStrictEqual(orderedRuleNames);
        expect(plugin.processors).toStrictEqual({});
    });

    it("matches the generated ESM runtime export", async () => {
        expect.hasAssertions();

        const runtimePluginModule = await import("../plugin.mjs");

        expect(runtimePluginModule.default).toStrictEqual(
            expect.objectContaining({ meta: plugin.meta })
        );
    });
});
