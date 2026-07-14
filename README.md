# @typpi/eslint-plugin-codex

[![npm](https://flat.badgen.net/npm/v/@typpi/eslint-plugin-codex?color=blue)](https://www.npmjs.com/package/@typpi/eslint-plugin-codex) [![CI](https://github.com/Nick2bad4u/eslint-plugin-codex/actions/workflows/ci.yml/badge.svg)](https://github.com/Nick2bad4u/eslint-plugin-codex/actions/workflows/ci.yml) [![codecov](https://codecov.io/gh/Nick2bad4u/eslint-plugin-codex/branch/main/graph/badge.svg)](https://codecov.io/gh/Nick2bad4u/eslint-plugin-codex) [![license](https://flat.badgen.net/npm/license/@typpi/eslint-plugin-codex?color=purple)](LICENSE)

Objective ESLint checks for Codex customization files. The plugin validates the parts that can be checked statically—file placement, required metadata, supported configuration values, instruction budgets, MCP transports, and hook structure—without trying to judge prose quality.

This is an independent community project. It is not affiliated with, endorsed by, or maintained by OpenAI.

## Supported files

- `AGENTS.md` and `AGENTS.override.md` instruction chains
- Agent Skills under `.agents/skills/` and plugin skill roots
- standalone custom agents under `.codex/agents/*.toml`
- `.codex/config.toml` and standalone `*.config.toml` profiles
- `.codex/hooks.json` and inline `[hooks]` TOML
- deprecated `.codex/prompts/*.md` files, so migrations are not missed

The catalog deliberately excludes subjective prompt-style rules, model allowlists, filename conventions that Codex does not require, and experimental execution-policy syntax.

## Installation

```sh
npm install --save-dev @typpi/eslint-plugin-codex eslint @eslint/markdown @eslint/json
```

Requirements:

- Node.js 22 or newer
- ESLint 9.15 or 10
- ESLint flat config

## Quick start

The standard presets register the Markdown and JSON language plugins and configure TOML parsing:

```js
import codex from "@typpi/eslint-plugin-codex";

export default [...codex.configs.recommended];
```

If a shared config already registers `markdown` from `@eslint/markdown` and `json` from `@eslint/json`, use the corresponding `*-without-language-plugins` variant after that registration:

```js
import codex from "@typpi/eslint-plugin-codex";
import sharedConfig from "your-shared-eslint-config";

export default [
 ...sharedConfig,
 ...codex.configs["recommended-without-language-plugins"],
];
```

## Presets

| Preset                      | Intended use                                                            |
| --------------------------- | ----------------------------------------------------------------------- |
| `codex.configs.minimal`     | Required structure that would otherwise leave a customization unusable. |
| `codex.configs.recommended` | Objective correctness and current-feature checks for most repositories. |
| `codex.configs.strict`      | Recommended rules plus security and ambiguity guardrails.               |
| `codex.configs.all`         | Every stable rule, including advisory project-hygiene checks.           |

Each preset is a three-layer flat-config array for Markdown, TOML, and JSON. Spread it into your config; do not insert the array as one item.

## Rules

| Rule                                                                                                                                             | all | minimal | recommended | strict |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | :-: | :-----: | :---------: | :----: |
| [`max-agents-instruction-chain-bytes`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/max-agents-instruction-chain-bytes)           | ✅  |    —    |     ✅      |   ✅   |
| [`no-conflicting-mcp-tool-lists`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-conflicting-mcp-tool-lists)                     | ✅  |    —    |      —      |   ✅   |
| [`no-deprecated-config-features`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-deprecated-config-features)                     | ✅  |    —    |     ✅      |   ✅   |
| [`no-deprecated-custom-prompts`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-deprecated-custom-prompts)                       | ✅  |    —    |     ✅      |   ✅   |
| [`no-duplicate-skill-names`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-duplicate-skill-names)                               | ✅  |    —    |      —      |   ✅   |
| [`no-empty-agents-md`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-empty-agents-md)                                           | ✅  |   ✅    |     ✅      |   ✅   |
| [`no-empty-skill-body`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-empty-skill-body)                                         | ✅  |    —    |     ✅      |   ✅   |
| [`no-full-access-without-approval`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-full-access-without-approval)                 | ✅  |    —    |      —      |   ✅   |
| [`no-ignored-hook-matcher`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-ignored-hook-matcher)                                 | ✅  |    —    |     ✅      |   ✅   |
| [`no-ignored-project-config-keys`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-ignored-project-config-keys)                   | ✅  |    —    |     ✅      |   ✅   |
| [`no-legacy-profile-config`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-legacy-profile-config)                               | ✅  |    —    |     ✅      |   ✅   |
| [`no-mixed-hook-representations`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-mixed-hook-representations)                     | ✅  |    —    |     ✅      |   ✅   |
| [`no-mixed-permission-models`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-mixed-permission-models)                           | ✅  |    —    |     ✅      |   ✅   |
| [`no-unsupported-hook-handler`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-unsupported-hook-handler)                         | ✅  |    —    |     ✅      |   ✅   |
| [`prefer-environment-mcp-credentials`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/prefer-environment-mcp-credentials)           | ✅  |    —    |      —      |   ✅   |
| [`require-custom-agent-fields`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-custom-agent-fields)                         | ✅  |   ✅    |     ✅      |   ✅   |
| [`require-existing-relative-skill-links`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-existing-relative-skill-links)     | ✅  |    —    |      —      |   ✅   |
| [`require-relative-skill-links`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-relative-skill-links)                       | ✅  |    —    |     ✅      |   ✅   |
| [`require-skill-frontmatter`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-skill-frontmatter)                             | ✅  |   ✅    |     ✅      |   ✅   |
| [`require-skill-location`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-skill-location)                                   | ✅  |    —    |     ✅      |   ✅   |
| [`require-skill-md-filename`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-skill-md-filename)                             | ✅  |    —    |     ✅      |   ✅   |
| [`require-skill-name-match-directory`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-skill-name-match-directory)           | ✅  |    —    |      —      |   ✅   |
| [`require-valid-agent-nickname-candidates`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-agent-nickname-candidates) | ✅  |    —    |     ✅      |   ✅   |
| [`require-valid-hook-events`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-hook-events)                             | ✅  |    —    |     ✅      |   ✅   |
| [`require-valid-hook-structure`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-hook-structure)                       | ✅  |   ✅    |     ✅      |   ✅   |
| [`require-valid-mcp-approval-mode`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-mcp-approval-mode)                 | ✅  |    —    |     ✅      |   ✅   |
| [`require-valid-mcp-transport`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-mcp-transport)                         | ✅  |    —    |     ✅      |   ✅   |
| [`require-valid-skill-compatibility`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-skill-compatibility)             | ✅  |    —    |      —      |   ✅   |
| [`require-valid-skill-description`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-skill-description)                 | ✅  |    —    |     ✅      |   ✅   |
| [`require-valid-skill-directory-name`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-skill-directory-name)           | ✅  |    —    |     ✅      |   ✅   |
| [`require-valid-skill-license`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-skill-license)                         | ✅  |    —    |      —      |   ✅   |
| [`require-valid-skill-name`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-skill-name)                               | ✅  |    —    |     ✅      |   ✅   |

## Documentation

- [Getting started](docs/rules/getting-started.md)
- [Rule overview](docs/rules/overview.md)
- [Preset matrix](docs/rules/presets/index.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

The rule behavior is grounded in the [official Codex manual](https://learn.chatgpt.com/docs/customization/overview) and the open [Agent Skills specification](https://agentskills.io/specification). Documentation links are evidence, not an affiliation claim.

## License

[MIT](LICENSE)
