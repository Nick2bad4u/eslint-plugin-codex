import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { createRuleDocsUrl } from "../src/_internal/rule-docs-url";
import { codexRules } from "../src/_internal/rules-registry";
import plugin from "../src/plugin";

const getRuleSourceFileNames = (): readonly string[] => {
    const rulesDirectory = path.join(process.cwd(), "src", "rules");

    return fs
        .readdirSync(rulesDirectory)
        .filter((entry) => entry.endsWith(".ts"))
        .map((entry) => entry.replace(/\.ts$/v, ""))
        .toSorted((left, right) => left.localeCompare(right));
};

describe("rule metadata integrity", () => {
    it("registers one runtime rule per source file", () => {
        expect.hasAssertions();
        expect(
            Object.keys(plugin.rules).toSorted((left, right) =>
                left.localeCompare(right)
            )
        ).toStrictEqual(getRuleSourceFileNames());
    });

    it("keeps canonical docs metadata on every rule", () => {
        expect.hasAssertions();

        for (const [ruleName, ruleModule] of Object.entries(codexRules)) {
            const docs = ruleModule.meta.docs;

            if (docs === undefined) {
                throw new Error(
                    `Rule ${ruleName} is missing docs metadata at runtime.`
                );
            }

            expect(docs.url).toBe(createRuleDocsUrl(ruleName));
            expect(docs.ruleId).toMatch(/^R\d{3}$/v);
            expect(docs.ruleNumber).toBeGreaterThan(0);
            expect(docs.codexConfigNames.length).toBeGreaterThan(0);
        }
    });
});
