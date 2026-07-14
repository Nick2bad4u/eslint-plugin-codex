# Script instructions

- Write Node.js ESM scripts with `// @ts-check`; prefer repository dependencies and cross-platform Node APIs over shell-specific behavior.
- Maintenance scripts must be deterministic and non-interactive. A `--check` mode must exit nonzero on drift; a `--write` mode may update only its declared generated surface.
- Import the built plugin when runtime metadata is the source of truth. Ensure callers build first.
- Preserve existing line endings where practical and format generated Markdown with the repository Prettier configuration before comparing it.
- Validate inputs before filesystem writes. Do not execute content loaded from Codex customization files.
- Add or update package scripts and CI checks whenever a new generated surface is introduced.
