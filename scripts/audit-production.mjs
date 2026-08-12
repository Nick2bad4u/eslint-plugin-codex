// @ts-check

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const packageJson = JSON.parse(
    await readFile(new URL("../package.json", import.meta.url), "utf8")
);

if (
    typeof packageJson !== "object" ||
    packageJson === null ||
    typeof packageJson.dependencies !== "object" ||
    packageJson.dependencies === null ||
    typeof packageJson.peerDependencies !== "object" ||
    packageJson.peerDependencies === null
) {
    throw new TypeError("package.json must declare dependency objects");
}

const optionalPeers = new Set(
    Object.entries(packageJson.peerDependenciesMeta ?? {})
        .filter(([, metadata]) => metadata?.optional === true)
        .map(([name]) => name)
);
const dependencies = {
    ...packageJson.dependencies,
    ...Object.fromEntries(
        Object.entries(packageJson.peerDependencies).filter(
            ([name]) => !optionalPeers.has(name)
        )
    ),
};
const auditDirectory = await mkdtemp(
    join(tmpdir(), "eslint-plugin-codex-audit-")
);
const npmCliPath = process.env["npm_execpath"];
const childEnvironment = { ...process.env };

delete childEnvironment["npm_config_allow_scripts"];

if (npmCliPath === undefined || npmCliPath.length === 0) {
    throw new Error("npm_execpath is required; run this script through npm");
}

try {
    await writeFile(
        join(auditDirectory, "package.json"),
        `${JSON.stringify(
            {
                name: "eslint-plugin-codex-production-audit",
                version: "0.0.0",
                private: true,
                dependencies,
            },
            undefined,
            2
        )}\n`
    );

    for (const arguments_ of [
        [
            "install",
            "--package-lock-only",
            "--ignore-scripts",
            "--no-audit",
            "--no-fund",
        ],
        [
            "audit",
            "--omit=dev",
            "--audit-level=moderate",
        ],
    ]) {
        const result = spawnSync(
            process.execPath,
            [npmCliPath, ...arguments_],
            {
                cwd: auditDirectory,
                env: childEnvironment,
                stdio: "inherit",
            }
        );

        if (result.error !== undefined) {
            throw result.error;
        }

        if (result.status !== 0) {
            process.exitCode = result.status ?? 1;
            break;
        }
    }
} finally {
    await rm(auditDirectory, { force: true, recursive: true });
}
