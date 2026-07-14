# strict

Recommended checks plus security and ambiguity guardrails. Use this when Codex configuration is reviewed as production automation rather than personal local preference.

```js
import codex from "@typpi/eslint-plugin-codex";

export default [...codex.configs.strict];
```

## Rules in this preset

- `Fix` legend:
  - `🔧` = autofixable
  - `💡` = suggestions available
  - `—` = report only

| Rule                                                                                                                                             | Fix |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | :-: |
| [`max-agents-instruction-chain-bytes`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/max-agents-instruction-chain-bytes)           |  —  |
| [`no-conflicting-mcp-tool-lists`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-conflicting-mcp-tool-lists)                     |  —  |
| [`no-deprecated-config-features`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-deprecated-config-features)                     |  —  |
| [`no-deprecated-custom-prompts`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-deprecated-custom-prompts)                       |  —  |
| [`no-duplicate-skill-names`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-duplicate-skill-names)                               |  —  |
| [`no-empty-agents-md`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-empty-agents-md)                                           |  —  |
| [`no-empty-skill-body`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-empty-skill-body)                                         |  —  |
| [`no-full-access-without-approval`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-full-access-without-approval)                 |  —  |
| [`no-ignored-hook-matcher`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-ignored-hook-matcher)                                 |  —  |
| [`no-ignored-hook-matcher`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-ignored-hook-matcher)                                 |  —  |
| [`no-ignored-project-config-keys`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-ignored-project-config-keys)                   |  —  |
| [`no-legacy-profile-config`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-legacy-profile-config)                               |  —  |
| [`no-mixed-hook-representations`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-mixed-hook-representations)                     |  —  |
| [`no-mixed-permission-models`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-mixed-permission-models)                           |  —  |
| [`no-unsupported-hook-handler`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-unsupported-hook-handler)                         |  —  |
| [`no-unsupported-hook-handler`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-unsupported-hook-handler)                         |  —  |
| [`prefer-environment-mcp-credentials`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/prefer-environment-mcp-credentials)           |  —  |
| [`require-custom-agent-fields`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-custom-agent-fields)                         |  —  |
| [`require-existing-relative-skill-links`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-existing-relative-skill-links)     |  —  |
| [`require-relative-skill-links`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-relative-skill-links)                       |  —  |
| [`require-skill-frontmatter`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-skill-frontmatter)                             |  —  |
| [`require-skill-location`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-skill-location)                                   |  —  |
| [`require-skill-md-filename`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-skill-md-filename)                             |  —  |
| [`require-skill-name-match-directory`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-skill-name-match-directory)           |  —  |
| [`require-valid-agent-nickname-candidates`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-agent-nickname-candidates) |  —  |
| [`require-valid-hook-events`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-hook-events)                             |  —  |
| [`require-valid-hook-events`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-hook-events)                             |  —  |
| [`require-valid-hook-structure`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-hook-structure)                       |  —  |
| [`require-valid-hook-structure`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-hook-structure)                       |  —  |
| [`require-valid-mcp-approval-mode`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-mcp-approval-mode)                 |  —  |
| [`require-valid-mcp-transport`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-mcp-transport)                         |  —  |
| [`require-valid-skill-compatibility`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-skill-compatibility)             |  —  |
| [`require-valid-skill-description`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-skill-description)                 |  —  |
| [`require-valid-skill-directory-name`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-skill-directory-name)           |  —  |
| [`require-valid-skill-license`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-skill-license)                         |  —  |
| [`require-valid-skill-name`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-skill-name)                               |  —  |
