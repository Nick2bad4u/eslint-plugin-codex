# Test instructions

- Use Vitest and explicit assertions. Test message IDs rather than full prose unless wording itself is the contract.
- Use `lintMarkdownRule` for isolated Markdown behavior and `lintCodexFiles` for TOML, JSON, filesystem discovery, or multi-file cases.
- Integration fixtures are written to a temporary repository and linted through the real ESLint API. Keep fixture paths representative of Codex discovery rules.
- Cover both accepted and rejected configurations, plus irrelevant paths that the rule must ignore.
- Add cross-format parity tests for any hook behavior because hooks are supported in `hooks.json` and inline TOML.
- Do not weaken coverage thresholds or replace behavioral assertions with snapshots merely to make a test pass.
- Run `npm test`, `npm run typecheck`, and `npm run test:coverage` after broad rule changes.
