# Codex prompt 03 - Canonical transformer

```txt
You are working in this repository. Follow AGENTS.md.

Read these files before editing:
- docs/03-canonical-token-model.md
- docs/04-token-build-pipeline.md

Task:
Implement the canonical token transformer in @demo-ds/token-pipeline and wire it into @demo-ds/tokens.

Implement:
- Source JSON parser that flattens nested token objects into source records.
- Name normalisation utilities.
- Source path to canonical path mapping.
- Colour value normalisation to uppercase hex.
- Spacing mapping to dimension tokens with px unit.
- Radius mapping from Corder-radius/Corner-* source names to radius tokens.
- Typography grouping for FontSize, LineHeight, and FontWeight.
- Light/dark semantic token merge.
- Canonical TypeScript types.
- Runtime canonical validation using Zod or JSON Schema.

Output:
- packages/tokens/dist/canonical.json

Do not generate CSS or Mantine output in this task except placeholders if needed. Keep this task focused on canonical JSON.

Acceptance criteria:
- Canonical output is deterministic.
- Canonical JSON includes color, space, radius, and typography tokens.
- Semantic colour tokens have light and dark values.
- Source metadata and forbidden keys do not appear in canonical output.
- Tests cover source parsing, name normalisation, colour conversion, mode merge, radius mapping, and typography grouping.

Run:
- pnpm tokens:scan
- pnpm --filter @demo-ds/token-pipeline test
- pnpm --filter @demo-ds/tokens build
- pnpm --filter @demo-ds/tokens test

Report the generated files and command results.
```
