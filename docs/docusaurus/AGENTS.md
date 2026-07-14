# Docusaurus instructions

- The site is deployed under `/eslint-plugin-codex/`; use Docusaurus `Link`, `useBaseUrl`, or configured site URLs instead of hardcoded root-relative assets.
- Keep sidebar document IDs synchronized with real files under `docs/rules` and generated TypeDoc content.
- Reuse `src/components/siteData.ts` for repeated public links and project metadata.
- Branding must remain original and must include no OpenAI or copied Copilot logos. Regenerate raster sizes from `static/img/logo.svg` when the mark changes.
- Keep the site accessible: meaningful image alt text, keyboard-safe links, readable contrast, and no information conveyed only by color.
- Run `npm run --workspace docs/docusaurus typecheck` and `npm run docs:build`; inspect the built site when layout or assets change.
