---
sidebar_position: 1
slug: /
---

# Rule overview

`eslint-plugin-codex` checks Codex customization contracts that are objective enough to enforce without guessing what the author meant.

## Coverage

- active `AGENTS.md` / `AGENTS.override.md` discovery chains and their cumulative UTF-8 byte budget
- Agent Skills frontmatter, directory naming, canonical filenames, links, and non-empty instructions
- standalone custom-agent required fields and nickname candidates
- current, deprecated, ignored, and security-sensitive Codex TOML settings
- MCP server transports, approval modes, allow/deny conflicts, and credential placement
- lifecycle hook event names, matcher groups, handler structure, ignored matchers, and unsupported handler modes in both JSON and TOML
- explicit migration diagnostics for deprecated custom prompts and profile syntax

## Deliberate exclusions

The plugin does not score prompt quality, require a particular model, ban intentional built-in agent overrides, require custom-agent filenames to match their declared names, or enforce experimental execution-policy syntax. Those would turn preferences or unstable implementation details into false errors.

All rules are report-only in the initial release. Configuration rewrites are not safely mechanical: deleting or renaming a key can change sandbox, approval, tool, or hook behavior. The plugin favors a precise diagnostic over a risky autofix.

## Preset policy

- `minimal`: required structure for usable customization files
- `recommended`: current, objective correctness checks with low false-positive risk
- `strict`: recommended plus security and ambiguity guardrails
- `all`: all stable checks, including advisory hygiene rules

Preset membership is cumulative and generated from runtime rule metadata. See the [preset matrix](presets/index.md) for the exact catalog.

## Project status

This is an independent community plugin and is not affiliated with or endorsed by OpenAI. Rule documentation links to primary specifications so behavior can be audited as Codex evolves.
