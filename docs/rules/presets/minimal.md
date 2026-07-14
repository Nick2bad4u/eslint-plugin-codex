# minimal

Essential structure checks for repositories that want the smallest useful policy. It catches empty instructions, unusable skill metadata, incomplete custom-agent definitions, and malformed hook containers.

```js
import codex from "@typpi/eslint-plugin-codex";

export default [...codex.configs.minimal];
```

## Rules in this preset

- `Fix` legend:
  - `🔧` = autofixable
  - `💡` = suggestions available
  - `—` = report only

| Rule                                                                                                                       | Fix |
| -------------------------------------------------------------------------------------------------------------------------- | :-: |
| [`no-empty-agents-md`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/no-empty-agents-md)                     |  —  |
| [`require-custom-agent-fields`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-custom-agent-fields)   |  —  |
| [`require-skill-frontmatter`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-skill-frontmatter)       |  —  |
| [`require-valid-hook-structure`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-hook-structure) |  —  |
| [`require-valid-hook-structure`](https://nick2bad4u.github.io/eslint-plugin-codex/docs/rules/require-valid-hook-structure) |  —  |
