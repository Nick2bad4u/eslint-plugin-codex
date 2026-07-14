import process from "node:process";

import { ESLint } from "eslint";
import pc from "picocolors";

import plugin from "../plugin.mjs";

/**
 * @typedef {Readonly<{
 *     children: readonly unknown[];
 *     comments: readonly unknown[];
 *     loc: Readonly<{
 *         end: Readonly<{ column: number; line: number }>;
 *         start: Readonly<{ column: number; line: number }>;
 *     }>;
 *     range: readonly [number, number];
 *     tokens: readonly unknown[];
 *     type: "root";
 * }>} CompatAst
 */

/**
 * @typedef {{
 *     block: CompatAst;
 *     childScopes: CompatScope[];
 *     isStrict: boolean;
 *     references: unknown[];
 *     set: Map<string, unknown>;
 *     through: unknown[];
 *     type: "global";
 *     upper: null;
 *     variableScope: CompatScope;
 *     variables: unknown[];
 * }} CompatScope
 */

/**
 * @typedef {Readonly<{
 *     acquire: (node: unknown) => CompatScope | null;
 *     getDeclaredVariables: (node?: unknown) => readonly unknown[];
 *     scopes: readonly [CompatScope];
 * }>} CompatScopeManager
 */

/**
 * @typedef {Readonly<{
 *     configName: "all" | "minimal";
 *     expectedMaximumMessages?: number;
 *     expectedMinimumMessages: number;
 *     filePath: string;
 *     name: string;
 *     ruleId: string;
 *     text: string;
 * }>} Scenario
 */

const expectedEslintMajorArgumentPrefix = "--expect-eslint-major=";

const minimumLanguageKeyRuntimeMajor = 9;
const minimumLanguageKeyRuntimeMinor = 15;

/**
 * @param {string} text
 *
 * @returns {CompatAst}
 */
const createEmptyProgramAst = (text) => {
    const lineBreaks = text.match(/\n/gv) ?? [];
    const lastLineStartOffset = text.lastIndexOf("\n") + 1;

    return {
        children: [],
        comments: [],
        loc: {
            end: {
                column: text.length - lastLineStartOffset,
                line: lineBreaks.length + 1,
            },
            start: {
                column: 0,
                line: 1,
            },
        },
        range: [0, text.length],
        tokens: [],
        type: "root",
    };
};

/**
 * @param {CompatAst} ast
 *
 * @returns {CompatScopeManager}
 */
const createLegacyScopeManager = (ast) => {
    const globalScope = /** @type {CompatScope} */ ({
        block: ast,
        childScopes: [],
        isStrict: true,
        references: [],
        set: new Map(),
        through: [],
        type: "global",
        upper: null,
        variableScope: /** @type {CompatScope} */ ({}),
        variables: [],
    });

    globalScope.variableScope = globalScope;

    return {
        /** @param {unknown} node */
        acquire(node) {
            return node === ast ? globalScope : null;
        },
        getDeclaredVariables() {
            return [];
        },
        scopes: [globalScope],
    };
};

const legacySmokeParser = {
    meta: {
        name: "eslint-plugin-codex/compat-smoke-parser",
        version: "1.0.0",
    },
    /** @param {string} text */
    parseForESLint(text) {
        const ast = createEmptyProgramAst(text);

        return {
            ast,
            scopeManager: createLegacyScopeManager(ast),
            services: {},
            visitorKeys: {
                root: [],
            },
        };
    },
};

/**
 * @param {readonly string[]} argv
 *
 * @returns {number | undefined}
 */
const parseExpectedEslintMajor = (argv) => {
    const matchingArgument = argv.find((argument) =>
        argument.startsWith(expectedEslintMajorArgumentPrefix)
    );

    if (matchingArgument === undefined) {
        return undefined;
    }

    const majorString = matchingArgument.slice(
        expectedEslintMajorArgumentPrefix.length
    );

    if (majorString.length === 0) {
        throw new Error(
            `Missing ESLint major value in argument: ${matchingArgument}`
        );
    }

    const majorValue = Number.parseInt(majorString, 10);

    if (Number.isNaN(majorValue)) {
        throw new TypeError(
            `Invalid ESLint major value in argument: ${matchingArgument}`
        );
    }

    return majorValue;
};

/**
 * @param {number | undefined} expectedMajor
 */
const assertEslintMajor = (expectedMajor) => {
    const runtimeVersion = ESLint.version;

    if (typeof runtimeVersion !== "string" || runtimeVersion.length === 0) {
        throw new Error(
            `Unable to determine ESLint runtime version: ${String(runtimeVersion)}`
        );
    }

    const [runtimeMajorText] = runtimeVersion.split(".", 1);

    if (runtimeMajorText === undefined || runtimeMajorText.length === 0) {
        throw new Error(
            `Unable to parse ESLint runtime version: ${runtimeVersion}`
        );
    }

    const runtimeMajor = Number.parseInt(runtimeMajorText, 10);

    if (Number.isNaN(runtimeMajor)) {
        throw new TypeError(
            `Unable to parse ESLint runtime version: ${runtimeVersion}`
        );
    }

    if (expectedMajor !== undefined && runtimeMajor !== expectedMajor) {
        throw new Error(
            `Expected ESLint major ${expectedMajor}, but detected ${runtimeVersion}.`
        );
    }

    console.log(
        `${pc.green("✓")}` +
            ` ESLint runtime ${pc.bold(runtimeVersion)} detected for compatibility smoke checks.`
    );
};

/**
 * @returns {readonly [major: number, minor: number, patch: number]}
 */
const getRuntimeVersionTuple = () => {
    const runtimeVersion = ESLint.version;

    if (typeof runtimeVersion !== "string" || runtimeVersion.length === 0) {
        throw new Error(
            `Unable to determine ESLint runtime version: ${String(runtimeVersion)}`
        );
    }

    const [
        majorText = "0",
        minorText = "0",
        patchText = "0",
    ] = runtimeVersion.split(".");
    const major = Number.parseInt(majorText, 10);
    const minor = Number.parseInt(minorText, 10);
    const patch = Number.parseInt(patchText, 10);

    if (
        [
            major,
            minor,
            patch,
        ].some((value) => Number.isNaN(value))
    ) {
        throw new Error(
            `Unable to parse ESLint runtime version tuple: ${runtimeVersion}`
        );
    }

    return [
        major,
        minor,
        patch,
    ];
};

/**
 * @returns {boolean}
 */
const runtimeSupportsLanguageKey = () => {
    const [major, minor] = getRuntimeVersionTuple();

    if (major !== minimumLanguageKeyRuntimeMajor) {
        return major > minimumLanguageKeyRuntimeMajor;
    }

    return minor >= minimumLanguageKeyRuntimeMinor;
};

/**
 * @param {import("eslint").Linter.Config} configEntry
 *
 * @returns {import("eslint").Linter.Config}
 */
const normalizeConfigEntryForLegacyFlatConfig = (configEntry) => {
    if (runtimeSupportsLanguageKey()) {
        return configEntry;
    }

    const legacyCompatibleConfigEntry = {
        ...configEntry,
    };

    Reflect.deleteProperty(legacyCompatibleConfigEntry, "language");

    /** @type {import("eslint").Linter.Config} */
    const normalizedConfigEntry = {
        ...legacyCompatibleConfigEntry,
        languageOptions: {
            ...legacyCompatibleConfigEntry.languageOptions,
            parser: legacySmokeParser,
        },
    };

    if (configEntry.plugins !== undefined && "codex" in configEntry.plugins) {
        normalizedConfigEntry.plugins = {
            codex: configEntry.plugins["codex"],
        };
    }

    return normalizedConfigEntry;
};

/**
 * @param {"all" | "minimal"} configName
 *
 * @returns {import("eslint").Linter.Config[]}
 */
const createCompatibilityConfig = (configName) => {
    const baseConfig = plugin.configs?.[configName];

    if (baseConfig === undefined) {
        throw new Error(
            `Plugin ${configName} config is unavailable. Compatibility smoke test cannot continue.`
        );
    }

    const configEntries = Array.isArray(baseConfig) ? baseConfig : [baseConfig];

    return configEntries.map((configEntry, index) => {
        const normalizedConfigEntry =
            /** @type {import("eslint").Linter.Config} */ (
                /** @type {unknown} */ (configEntry)
            );

        return {
            ...normalizeConfigEntryForLegacyFlatConfig(normalizedConfigEntry),
            name:
                index === 0
                    ? `compat-smoke:${configName}`
                    : `compat-smoke:${configName}:${index + 1}`,
        };
    });
};

/**
 * @param {Scenario} scenario
 */
const runScenario = async ({
    configName,
    expectedMaximumMessages,
    expectedMinimumMessages,
    filePath,
    name,
    ruleId,
    text,
}) => {
    const eslint = new ESLint({
        ignore: false,
        overrideConfig: createCompatibilityConfig(configName),
        overrideConfigFile: true,
    });

    const lintResults = await eslint.lintText(text, { filePath });

    const fatalMessages = lintResults.flatMap((result) =>
        result.messages.filter((message) => message.fatal === true)
    );

    if (fatalMessages.length > 0) {
        throw new Error(
            `${name}: encountered fatal parse/runtime diagnostics (${fatalMessages.length}).`
        );
    }

    const matchingMessages = lintResults.flatMap((result) =>
        result.messages.filter((message) => message.ruleId === ruleId)
    );

    if (matchingMessages.length < expectedMinimumMessages) {
        throw new Error(
            `${name}: expected at least ${expectedMinimumMessages} ${ruleId} message(s), received ${matchingMessages.length}.`
        );
    }

    if (
        expectedMaximumMessages !== undefined &&
        matchingMessages.length > expectedMaximumMessages
    ) {
        throw new Error(
            `${name}: expected at most ${expectedMaximumMessages} ${ruleId} message(s), received ${matchingMessages.length}.`
        );
    }

    console.log(
        `${pc.green("✓")}` +
            ` ${pc.bold(name)} ${pc.gray("->")} ${pc.bold(ruleId)} (${configName}) produced ${pc.magenta(
                String(matchingMessages.length)
            )} message(s).`
    );
};

const scenarios = /** @type {const} */ ([
    {
        configName: "minimal",
        expectedMinimumMessages: 1,
        filePath: "AGENTS.md",
        name: "empty-agents-instructions",
        ruleId: "codex/no-empty-agents-md",
        text: "<!-- placeholder -->\n",
    },
    {
        configName: "all",
        expectedMinimumMessages: 1,
        filePath: ".agents/skills/review/SKILL.md",
        name: "skill-frontmatter-required",
        ruleId: "codex/require-skill-frontmatter",
        text: "Review the repository carefully.\n",
    },
    {
        configName: "minimal",
        expectedMinimumMessages: 1,
        filePath: ".codex/hooks.json",
        name: "hook-structure-required",
        ruleId: "codex/require-valid-hook-structure",
        text: "{}\n",
    },
]);

console.log(pc.bold(pc.cyan("Running ESLint 9 compatibility smoke checks...")));

const expectedEslintMajor = parseExpectedEslintMajor(process.argv.slice(2));
assertEslintMajor(expectedEslintMajor);

for (const scenario of scenarios) {
    await runScenario(scenario);
}

console.log(pc.bold(pc.green("ESLint 9 compatibility smoke checks passed.")));
