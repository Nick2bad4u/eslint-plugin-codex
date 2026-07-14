---
title: Docs architecture
description: How the docs application is structured, why the routes are separated, and how public and maintainer surfaces interlink.
---

# Docs architecture

The docs application is intentionally split into separate route families.

## Public product surfaces

These are the routes end users reach first:

- `/`
- `/project`
- `/resources`
- `/docs/rules/**`

They should stay focused on adoption, presets, and rule-reference navigation.

## Maintainer surfaces

These routes exist for people changing the repository and docs app itself:

- `/developer`
- `/developer/adrs/**`
- `/developer/api/**`

These pages explain **how** the docs are built and **why** the information
architecture looks the way it does.

## Source-of-truth split

- `docs/rules/**` contains the rule-reference content published with the plugin.
- `docs/docusaurus/src/pages/**` contains project-style landing pages.
- `docs/docusaurus/site-docs/developer/**` contains maintainer-facing docs.
- `scripts/sync-*.mjs` own generated README and preset matrix content.
- `docs/docusaurus/typedoc.config.json` owns generated API docs settings.

## Why this split exists

Mixing contributor/process material into the rule-reference tree makes the left
navigation worse for actual users.

Mixing public product landing pages into the same docs tree makes maintainers
fight route structure every time they add process documentation.

This split avoids both problems.
