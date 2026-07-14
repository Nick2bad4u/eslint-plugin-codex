# Documentation instructions

- Describe the plugin as an independent community project; never imply OpenAI affiliation or endorsement.
- Ground Codex behavior in current official documentation and skill metadata in the Agent Skills specification. Prefer primary links.
- Rule pages marked as generated come from `scripts/generate-rule-docs.mjs`; change runtime metadata or the generator, then run `npm run sync:rules:write`.
- Preset tables and the README matrix are generated from runtime preset membership. Do not edit their rows manually.
- Keep examples in ESLint flat-config form and spread preset arrays.
- Run `npm run sync:rules:write`, `npm run docs:check-links`, and `npm run docs:build` after documentation architecture changes.
