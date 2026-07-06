# Codex prompt 07 - Storybook site

```txt
You are working in this repository. Follow AGENTS.md.

Read these files before editing:
- docs/08-storybook-site.md
- docs/05-generated-token-outputs.md

Task:
Implement the Storybook app at apps/storybook.

Requirements:
- Use @storybook/react-vite.
- Configure stories from packages/components.
- Add a preview decorator with DemoThemeProvider.
- Import generated token CSS from @demo-ds/tokens.
- Add MDX/docs pages for introduction, token pipeline, theme, colours, spacing, radius, typography, and components.
- Render token tables from generated token-docs.json, not manually duplicated values.
- Demonstrate light and dark modes.

Acceptance criteria:
- pnpm --filter @demo-ds/storybook storybook starts locally.
- pnpm --filter @demo-ds/storybook build succeeds.
- Token docs render generated data.
- Component stories render inside theme provider.
- No raw fixture imports in Storybook.

Run:
- pnpm build
- pnpm --filter @demo-ds/storybook build

Report results.
```
