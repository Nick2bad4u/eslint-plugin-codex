# Source instructions

- Create rules with `createCodexRule` and a canonical name already present in the stable rule catalog.
- Keep rule listeners format-aware: Markdown uses `Document`, TOML uses `Program` with `toml-eslint-parser`, and hook rules must support both JSON and inline TOML through `createHookDocumentListener`.
- Gate every rule by a precise Codex path classifier before inspecting content.
- Use static values only. Rules must not execute commands, expand environment variables, contact services, or parse configuration with unsafe schemas.
- Put objective correctness checks in `recommended`; security/ambiguity policies in `strict`; advisory hygiene may be `all` only. Presets are cumulative.
- Add shared parsing or filesystem behavior under `_internal` only when at least two rules benefit or isolation materially improves testing.
- Keep public rule metadata complete: description, preset membership, messages, schema, type, and docs URL are validated at runtime.
- After changing rules or metadata, run `npm run build`, `npm run typecheck`, targeted tests, and `npm run sync:rules:write`.
