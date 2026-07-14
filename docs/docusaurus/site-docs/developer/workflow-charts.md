---
title: Workflow charts
description: Charts and flow maps for the docs, sync, and API-generation workflow.
---

# Workflow charts

This page turns the docs maintenance process into explicit flows instead of tribal knowledge.

## Docs publication flow

```text
rule docs + source metadata
        ↓
 preset / README sync scripts
        ↓
 developer docs + API generation
        ↓
   Docusaurus build
        ↓
 published site
```

## Surface ownership map

| Surface                           | Source of truth                     | Published route          |
| --------------------------------- | ----------------------------------- | ------------------------ |
| Rule overview and rule pages      | `docs/rules/**`                     | `/docs/rules/**`         |
| Project / resources landing pages | `src/pages/**`                      | `/project`, `/resources` |
| Developer docs and ADRs           | `site-docs/developer/**`            | `/developer/**`          |
| API reference                     | TypeDoc output from `src/plugin.ts` | `/developer/api/**`      |
| README rule matrix                | sync scripts                        | repository root README   |

## Validation flow

1. generate API docs
2. build docs site
3. validate typecheck
4. validate tests for synced surfaces
5. review browser output

## Why charts matter here

The docs app now has enough moving pieces that maintainers should not have to
reverse-engineer the flow from scripts every time they touch it.
