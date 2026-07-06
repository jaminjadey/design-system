# Codex prompt 05 - Mantine theme package

```txt
You are working in this repository. Follow AGENTS.md.

Read these files before editing:
- docs/06-mantine-theme-generation.md
- docs/10-tests-and-quality-gates.md

Task:
Implement @demo-ds/mantine-theme.

Use generated outputs from @demo-ds/tokens. Do not read raw fixture files.

Implement:
- src/theme.ts exporting demoTheme.
- src/cssVariablesResolver.ts exporting demoCssVariablesResolver if useful.
- src/DemoThemeProvider.tsx wrapping MantineProvider.
- src/index.ts public exports.
- Tests for theme mapping and provider rendering.

Map:
- Primitive primary palette to Mantine colours.
- Selected spacing values to Mantine spacing keys.
- Selected radius values to Mantine radius keys.
- Heading typography to Mantine headings.
- Generic font stack only.

Acceptance criteria:
- @demo-ds/mantine-theme builds.
- Provider renders children in a test.
- Theme has primary colours, spacing, radius, and headings.
- No private font names or hardcoded original source values are added.
- Components/apps can import DemoThemeProvider from the package root.

Run:
- pnpm --filter @demo-ds/tokens build
- pnpm --filter @demo-ds/mantine-theme build
- pnpm --filter @demo-ds/mantine-theme test
- pnpm typecheck

Report results.
```
