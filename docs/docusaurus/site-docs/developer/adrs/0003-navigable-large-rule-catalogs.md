---
title: ADR 0003 · Navigable large rule catalogs
description: Style and group the rule catalog so a large plugin stays scannable.
---

# ADR 0003 · Navigable large rule catalogs

## Status

Accepted

## Context

A large ESLint plugin quickly turns its docs sidebar into a wall of links.

This repository has enough rules that a flat, visually uniform list is a lousy navigation experience.

## Decision

Use grouped navigation with:

- section-specific labels and icons
- preset color coding
- left accent bars for rule families
- numbered rule entries for fast scanning

## Consequences

### Positive

- the rule sidebar is easier to scan
- preset docs stand out from rule docs
- users can orient themselves by family, not just alphabetically

### Negative

- sidebar styling is now part of the product surface and needs ongoing polish
- adding new families requires intentional color and label choices
