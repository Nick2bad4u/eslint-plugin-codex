// eslint-disable-next-line @eslint-community/eslint-comments/disable-enable-pair -- project-wide disable pattern for build configs
/* eslint-disable comment-length/limit-single-line-comments   -- Disable specific rules for build configs */

import pc from "picocolors";
import {
    coverageConfigDefaults,
    defaultExclude,
    defineConfig,
} from "vitest/config";

/** `true` when running under CI where worker parallelism should be bounded. */
const isCiEnvironment = process.env["CI"] === "true";
/** Raw worker-count input from environment or CI/local defaults. */
const configuredMaxWorkers =
    process.env["MAX_THREADS"] ?? (isCiEnvironment ? "1" : "8");
/** Parsed integer worker count prior to validation. */
const parsedMaxWorkers = Number.parseInt(configuredMaxWorkers, 10);
/** Safe positive worker-count used by Vitest thread pool settings. */
const maxWorkerCount =
    Number.isFinite(parsedMaxWorkers) && parsedMaxWorkers > 0
        ? parsedMaxWorkers
        : 1;
/** Raw flag controlling optional hanging-process reporter activation. */
const rawHangingReporterFlag =
    process.env["CODEX_VITEST_HANGING_PROCESS_REPORTER"] ??
    process.env["VITEST_HANGING_PROCESS_REPORTER"] ??
    "false";
/** Normalized `true` when hanging-process reporter is explicitly enabled. */
const shouldEnableHangingProcessReporter = [
    "1",
    "on",
    "true",
    "yes",
].includes(rawHangingReporterFlag.toLowerCase());
/** Shared reporter list for test runs with optional hanging-process diagnostics. */
const vitestReporters = shouldEnableHangingProcessReporter
    ? ["default", "hanging-process"]
    : ["default"];
/** Shared glob exclusions for generated/cache directories. */
const testExcludePatterns = [
    "**/.cache/**",
    "**/.stryker-tmp/**",
    "**/coverage/**",
    "**/dist/**",
    "**/node_modules/**",
];
/** Canonical test file include patterns for unit/integration suites. */
const testFilePatterns = ["test/**/*.{test,spec}.{ts,tsx,js,mjs,cjs,mts,cts}"];
/** Canonical include patterns for Vitest type-test discovery. */
const typecheckTestFilePatterns = [
    "**/*.{test,spec}-d.{ts,tsx,mts,cts}",
    "**/*.{test,spec}.{ts,tsx,mts,cts}",
];

/**
 * Vitest configuration for `@typpi/eslint-plugin-codex`.
 */
const vitestConfig: ReturnType<typeof defineConfig> = defineConfig({
    cacheDir: "./.cache/vitest",
    test: {
        // Directory for storing Vitest test attachments (screenshots, logs, etc.) in a hidden cache folder.
        // This helps keep test artifacts organized and out of the main source tree.
        attachmentsDir: "./.cache/vitest/.vitest-attachments",
        bail: 0,
        chaiConfig: {
            includeStack: false,
            showDiff: true,
            truncateThreshold: 40,
        },
        coverage: {
            allowExternal: false,
            clean: true, // Clean coverage directory before each run
            cleanOnRerun: true, // Clean on rerun in watch mode
            exclude: ["**/*.d.ts", ...coverageConfigDefaults.exclude],
            excludeAfterRemap: true, // Exclude files after remapping for accuracy
            include: ["plugin.mjs", "src/**/*.ts"],
            // V8 Provider Configuration (Recommended since Vitest v3.2.0)
            provider: "v8" as const, // Switch to V8 for better TypeScript support
            reporter: [
                "text",
                "json",
                "lcov",
                "html",
            ],

            reportOnFailure: true,
            reportsDirectory: "./coverage",
            skipFull: true, // Skip noisy full-file coverage reporting to keep strict reports focused on actionable gaps.
            thresholds: {
                // Auto-update requires Vitest to rewrite the originating config file.
                // Our configuration is generated dynamically via defineConfig callbacks,
                // which Magicast cannot safely mutate, so we keep this disabled to
                // avoid runtime parse failures during coverage reporting.
                autoUpdate: false,
                branches: 70,
                functions: 90,
                lines: 85,
                statements: 85,
            },
        },
        css: false,
        dangerouslyIgnoreUnhandledErrors: false,
        deps: {
            optimizer: {
                web: { enabled: false },
            },
        },
        diff: {
            aIndicator: pc.magenta(pc.bold("--")), // Magenta is much more readable than red
            bIndicator: pc.green(pc.bold("++")), // Clean single-character indicators
            expand: true,
            // The value 20 for maxDepth was chosen to provide sufficient context for deeply nested object diffs.
            // This helps debugging complex test failures, but may impact performance for very large or deeply nested objects.
            // Monitor test performance and adjust this value if you encounter slowdowns with large diffs.
            maxDepth: 20,
            omitAnnotationLines: true,
            printBasicPrototype: false,
            truncateAnnotation: pc.yellow(
                pc.bold("... Diff output truncated for readability")
            ), // Yellow is more eye-catching than cyan
            // The value 250 for truncateThreshold was selected to balance readability and performance.
            // It limits the maximum number of diff lines shown, preventing excessively long outputs
            // while still providing enough context for most test failures. Increasing this value may
            // slow down output and clutter logs; decreasing it could hide important diff details.
            truncateThreshold: 250,
        },
        env: {
            NODE_ENV: "test",
            PACKAGE_VERSION: process.env["PACKAGE_VERSION"] ?? "unknown",
        },
        environment: "node",
        exclude: [...testExcludePatterns, ...defaultExclude],
        expect: {
            poll: { interval: 50, timeout: 15_000 },
            // RuleTester-driven suites validate via ESLint internals rather than
            // direct Vitest `expect(...)` calls, so enabling this globally causes
            // false failures (`expected any number of assertion, but got none`).
            requireAssertions: false,
        },
        fakeTimers: {
            advanceTimeDelta: 20,
            loopLimit: 10_000,
            now: Date.now(),
            shouldAdvanceTime: false,
            shouldClearNativeTimers: true,
        },
        // Always run test files in parallel locally for speed.
        // CI disables file-level parallelism for deterministic resource usage.
        fileParallelism: !isCiEnvironment,
        globals: false,
        hookTimeout: 15_000,
        include: [...testFilePatterns],
        includeTaskLocation: true,
        isolate: true,
        logHeapUsage: true,
        // NOTE: Vitest v4 removed `test.poolOptions`. Use `maxWorkers` instead.
        // On Windows, keeping this bounded avoids worker starvation/timeouts.
        maxWorkers: maxWorkerCount,
        name: {
            color: "cyan",
            label: "Test", // Simplified label to match vitest.config.ts
        }, // Custom project name and color for Vitest
        outputFile: {
            json: "./coverage/test-results.json",
        },
        pool: "threads", // Use worker threads for better performance
        printConsoleTrace: false, // Disable stack trace printing for cleaner output
        // Improve test output
        reporters: vitestReporters,
        restoreMocks: true,
        retry: 0, // No retries to surface issues immediately
        sequence: {
            // Run projects sequentially to avoid resource contention
            concurrent: false,
            groupOrder: 0,
            setupFiles: "parallel",
        },
        setupFiles: ["./test/_internal/vitest-setup.ts"],
        slowTestThreshold: 300,
        teardownTimeout: 15_000,
        testTimeout: 15_000, // Set Vitest timeout to 15 seconds
        typecheck: {
            allowJs: false,
            checker: "tsc",
            enabled: true,
            exclude: [
                "**/.{idea,git,cache,output,temp}/**",
                "**/dist*/**",
                "**/html/**",
                ...defaultExclude,
            ],
            ignoreSourceErrors: false,
            include: [...typecheckTestFilePatterns],
            only: false,
            spawnTimeout: 10_000,
            tsconfig: "./tsconfig.vitest-typecheck.json",
        },
    },
});

export default vitestConfig;
