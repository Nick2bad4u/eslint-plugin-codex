import { describe, expect, it } from "vitest";

import {
    buildGitCliffArguments,
    resolvePackageVersionTag,
} from "../scripts/generate-release-notes.mjs";

const baseArguments = [
    "--config",
    "node_modules/gitcliff-config-nick2bad4u/cliff.toml",
    "--github-repo",
    "Nick2bad4u/eslint-plugin-codex",
];

describe(buildGitCliffArguments, () => {
    it("uses the normal current-tag mode outside a local release commit", () => {
        expect.assertions(1);

        expect(
            buildGitCliffArguments({
                additionalArguments: ["--output", "temp/notes.md"],
                headParent: null,
                headSubject: "fix: ordinary commit",
                headTags: [],
                previousTag: null,
            })
        ).toStrictEqual([
            ...baseArguments,
            "--current",
            "--output",
            "temp/notes.md",
        ]);
    });

    it("excludes an unpushed release commit from GitHub enrichment", () => {
        expect.assertions(1);

        expect(
            buildGitCliffArguments({
                additionalArguments: ["--output", "temp/notes.md"],
                headParent: "verified-main-sha",
                headSubject: "chore: release v1.0.2",
                headTags: ["v1.0.2"],
                previousTag: "v1.0.1",
            })
        ).toStrictEqual([
            ...baseArguments,
            "--tag",
            "v1.0.2",
            "--output",
            "temp/notes.md",
            "--",
            "v1.0.1..verified-main-sha",
        ]);
    });

    it("rejects a release commit without a previous release boundary", () => {
        expect.assertions(1);

        expect(() =>
            buildGitCliffArguments({
                additionalArguments: [],
                headParent: "verified-main-sha",
                headSubject: "chore: release v1.0.2",
                headTags: ["v1.0.2"],
                previousTag: null,
            })
        ).toThrow("Cannot derive the previous release range for v1.0.2.");
    });
});

describe(resolvePackageVersionTag, () => {
    it("uses the parent manifest version without requiring tag ancestry", () => {
        expect.assertions(1);

        expect(resolvePackageVersionTag('{"version":"1.0.1"}')).toBe("v1.0.1");
    });

    it("rejects a parent manifest without an exact version", () => {
        expect.assertions(1);

        expect(() => resolvePackageVersionTag('{"version":"latest"}')).toThrow(
            "The release parent package.json must contain an exact version."
        );
    });
});
