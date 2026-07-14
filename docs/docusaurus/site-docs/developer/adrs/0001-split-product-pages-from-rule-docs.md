---
title: ADR 0001 · Split product pages from rule docs
description: Keep public landing pages and deep rule-reference documentation as separate route families.
---

# ADR 0001 · Split product pages from rule docs

## Status

Accepted

## Context

The docs site serves at least two different audiences:

- adopters who need a clean landing page, presets, and rule overview
- maintainers who need architecture notes, sync workflows, ADRs, and API docs

Putting all of that into one left sidebar would make the rule-reference tree worse for end users.

## Decision

Keep these as separate route families:

- public pages under `/`, `/project`, and `/resources`
- rule docs under `/docs/rules/**`
- maintainer docs under `/developer/**`

## Consequences

### Positive

- public docs stay focused
- maintainer documentation can grow without polluting the rule catalog
- interlinking becomes explicit rather than accidental

### Negative

- route ownership is more complex
- maintainers must understand which surface belongs where
