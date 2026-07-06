# Codex prompt 06 - Components and stories

```txt
You are working in this repository. Follow AGENTS.md.

Read these files before editing:
- docs/07-react-components-package.md
- docs/08-storybook-site.md
- docs/10-tests-and-quality-gates.md

Task:
Implement the first @demo-ds/components package components and colocated stories.

Create components:
- Button
- TextInput
- AlertBanner
- Card
- StatusBadge
- PageHeader
- ThemeToggle

Requirements:
- Build on Mantine components.
- Use DemoThemeProvider in tests where needed.
- Avoid hardcoded hex values.
- Use semantic CSS variables for custom styles.
- Export public components and props from package root.
- Add stories for default and important variants.
- Add component tests.

Acceptance criteria:
- @demo-ds/components builds.
- Tests pass.
- Stories compile once Storybook is wired.
- Components do not import raw token fixtures.
- Components do not import package internals from sibling packages.

Run:
- pnpm --filter @demo-ds/tokens build
- pnpm --filter @demo-ds/mantine-theme build
- pnpm --filter @demo-ds/components build
- pnpm --filter @demo-ds/components test
- pnpm typecheck

Report results.
```
