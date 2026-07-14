# Contributing to @typpi/eslint-plugin-codex

Thanks for helping improve the plugin. It enforces objective Codex configuration contracts, so proposals need primary-source evidence and a clear false-positive boundary.

## Setup

Requirements are Node.js 22+, npm 11+, and Git.

```sh
npm ci --force
npm run build
npm test
```

`--force` is currently required because `madge@8` has an optional TypeScript peer range that does not include the repository's TypeScript 6 toolchain.

## Rule changes

1. Confirm the behavior in current official Codex documentation or the Agent Skills specification.
2. Append the rule name to `src/_internal/rule-catalog.ts`; never renumber existing catalog IDs.
3. Implement the rule under `src/rules/` and register it in `src/_internal/rules-registry.ts`.
4. Choose cumulative preset membership based on the policy in [the rule overview](./docs/rules/overview.md).
5. Add real ESLint integration tests for every relevant Markdown, TOML, or JSON representation.
6. Run `npm run sync:rules:write` to regenerate public documentation.

Rules should be deterministic and report-only unless a rewrite is provably behavior-preserving. Prompt-quality scoring, model preferences, and undocumented filename conventions are out of scope.

## Validation

Use focused commands while iterating, then run the complete gate before opening a pull request:

```sh
npm run release:verify
```

Do not lower coverage, disable a lint rule, or loosen package checks to accept a change. Fix the underlying issue or explain why the repository policy itself is wrong.

## Pull requests

- Use a focused `type/description` branch.
- Include source links in the PR description for new or changed Codex contracts.
- Keep generated docs, tests, and runtime metadata in the same change.
- Do not include credentials, private configuration, or proprietary prompt content in fixtures.

Report vulnerabilities privately through the process in [SECURITY.md](SECURITY.md).
