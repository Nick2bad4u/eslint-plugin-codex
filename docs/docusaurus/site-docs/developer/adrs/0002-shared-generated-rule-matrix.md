---
title: ADR 0002 · Shared generated rule matrix
description: Use one generator for preset matrices across the docs site and README.
---

# ADR 0002 · Shared generated rule matrix

## Status

Accepted

## Context

The README and preset overview page both communicate preset membership.

Maintaining separate renderers for that same information invites drift, inconsistent labels, and broken trust in docs.

## Decision

Use one generator as the source of truth for preset-matrix output and reuse it for both:

- the preset overview page
- the repository README rules section

## Consequences

### Positive

- less duplication
- fewer formatting drifts between surfaces
- tests can validate one generator instead of parallel hand-maintained output

### Negative

- generator changes need broader review because they affect multiple published surfaces at once
