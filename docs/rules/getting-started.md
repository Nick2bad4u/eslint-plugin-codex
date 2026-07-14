# Getting started

## Install

```sh
npm install --save-dev eslint-plugin-codex eslint @eslint/markdown @eslint/json
```

`eslint-plugin-codex` supports Node.js 22+, ESLint 9.15 and 10, and flat config.

## Choose a preset

```js
import codex from "eslint-plugin-codex";

export default [...codex.configs.recommended];
```

Presets are arrays because Codex customization spans three languages:

- Markdown for `AGENTS.md`, `AGENTS.override.md`, skills, and legacy prompts
- TOML for config layers and custom agents
- JSON for `hooks.json`

Always spread the selected preset. `recommended` is the normal starting point; `minimal` checks only essential structure, while `strict` adds security and ambiguity checks. `all` enables every stable rule.

## Shared-config composition

The normal variants register `@eslint/markdown` and `@eslint/json`. If an earlier shared config already registers those plugin namespaces, compose the external-registration variant instead:

```js
import codex from "eslint-plugin-codex";
import sharedConfig from "your-shared-eslint-config";

export default [
 ...sharedConfig,
 ...codex.configs["recommended-without-language-plugins"],
];
```

The TOML parser is configured directly in both variants.

## Override one rule

Place the override after the preset and match the file language:

```js
import codex from "eslint-plugin-codex";

export default [
 ...codex.configs.recommended,
 {
  files: ["**/.codex/config.toml"],
  rules: {
   "codex/max-agents-instruction-chain-bytes": ["error", { maxBytes: 48_000 }],
  },
 },
];
```

## Verify the setup

```sh
npx eslint AGENTS.md .agents/skills .codex
```

Only pass paths that exist in your repository. ESLint reports configuration parse failures separately from plugin rule diagnostics.

## Sources

- [Codex customization](https://learn.chatgpt.com/docs/customization/overview)
- [Custom instructions with AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Build skills](https://learn.chatgpt.com/docs/build-skills)
- [Codex configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference)
- [Codex hooks](https://learn.chatgpt.com/docs/hooks)
