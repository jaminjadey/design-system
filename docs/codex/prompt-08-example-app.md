# Codex prompt 08 - Example app

```txt
You are working in this repository. Follow AGENTS.md.

Read these files before editing:
- docs/09-example-react-app.md
- docs/13-acceptance-criteria.md

Task:
Implement the example React app at apps/example.

Requirements:
- Use Vite React.
- Wrap the app with DemoThemeProvider.
- Consume @demo-ds/components and @demo-ds/mantine-theme through package exports.
- Create generic pages: Overview, Forms, Settings, Tokens.
- Include a light/dark theme toggle.
- Use generic sample content only.
- Do not import package internals.
- Do not hardcode token colours.

Acceptance criteria:
- pnpm --filter @demo-ds/example dev starts locally.
- pnpm --filter @demo-ds/example build succeeds.
- App visibly demonstrates components and theme.
- App works separately from Storybook.

Run:
- pnpm build
- pnpm --filter @demo-ds/example build
- pnpm test

Report results.
```
