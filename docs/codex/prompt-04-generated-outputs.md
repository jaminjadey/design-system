# Codex prompt 04 - Generated outputs

```txt
You are working in this repository. Follow AGENTS.md.

Read these files before editing:
- docs/05-generated-token-outputs.md
- docs/10-tests-and-quality-gates.md

Task:
Generate package-consumable outputs from canonical tokens.

Implement generators for:
- packages/tokens/dist/tokens.css
- packages/tokens/dist/tokens.light.css
- packages/tokens/dist/tokens.dark.css
- packages/tokens/dist/index.ts or built JS equivalent
- packages/tokens/dist/token-names.ts or built JS equivalent
- packages/tokens/dist/metadata.json
- packages/tokens/dist/token-docs.json

Requirements:
- Generated CSS uses --ds-* custom properties.
- Light and dark semantic values use [data-mantine-color-scheme='light'] and [data-mantine-color-scheme='dark'] selectors.
- TypeScript exports token maps and token-name types.
- token-docs.json can be consumed by Storybook without scraping CSS.
- Generated files are deterministic.
- Generated files include generated-file headers where format allows.

Add tests for:
- CSS variable naming.
- Light/dark selectors.
- TypeScript token-name generation.
- Metadata content.
- Deterministic generation.

Acceptance criteria:
- pnpm --filter @demo-ds/tokens build creates all expected files.
- pnpm --filter @demo-ds/tokens test passes.
- Re-running generation produces no diff.

Run:
- pnpm tokens:scan
- pnpm --filter @demo-ds/tokens build
- pnpm --filter @demo-ds/tokens test
- git diff --stat

Report results.
```
