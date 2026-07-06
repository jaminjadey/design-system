# 16 - Tooling references

This plan intentionally avoids relying on private tooling. These public references were checked on 2026-07-06 and should be rechecked when implementing the repo.

## Token tooling

- Style Dictionary: https://styledictionary.com/
- Style Dictionary design-token docs: https://styledictionary.com/info/tokens/
- Design Tokens Community Group: https://www.w3.org/community/design-tokens/
- Design Tokens Format Module draft: https://www.designtokens.org/tr/drafts/format/

Notes:

- The fixture tokens use `$type` and `$value`, which is compatible with modern design-token terminology.
- The repo should still define its own canonical contract instead of exposing raw source format directly.
- Style Dictionary can be introduced as an emitter later, but a custom canonical transformer is useful for this fixture shape and for strong tests.

## Mantine

- Mantine: https://mantine.dev/
- MantineProvider: https://mantine.dev/theming/mantine-provider/
- Mantine theme object: https://mantine.dev/theming/theme-object/
- Mantine CSS variables: https://mantine.dev/styles/css-variables/
- Mantine CSS variables list: https://mantine.dev/styles/css-variables-list/

Notes:

- MantineProvider should be used at the root of the app.
- Mantine's theme object stores colours, fonts, spacing, radius, and related design tokens.
- Mantine exposes CSS variables from the theme, which fits this pipeline well.

## Storybook

- Storybook React Vite: https://storybook.js.org/docs/get-started/frameworks/react-vite
- Storybook Vite builder: https://storybook.js.org/docs/builders/vite

Notes:

- Storybook is used for isolated component development and documentation.
- React + Vite keeps the docs app close to the example app stack.

## Testing

- Vitest projects/workspaces: https://vitest.dev/guide/projects
- React Testing Library: https://testing-library.com/docs/react-testing-library/intro/
- Playwright component testing: https://playwright.dev/docs/test-components

Notes:

- Vitest is appropriate for TypeScript unit tests and package-level tests.
- React Testing Library is appropriate for DOM-oriented component tests.
- Playwright is optional for later browser and visual checks.

## Monorepo and release tooling

- pnpm workspaces: https://pnpm.io/workspaces
- Turborepo docs: https://turborepo.dev/docs
- Turborepo task configuration: https://turborepo.dev/docs/crafting-your-repository/configuring-tasks
- Changesets getting started: https://changesets.dev/guide/getting-started

Notes:

- pnpm workspaces give local package linking.
- Turborepo can coordinate package build/test tasks.
- Changesets can be added when package publishing becomes part of the demo.

## Codex

- Codex overview: https://developers.openai.com/codex
- Codex CLI: https://developers.openai.com/codex/cli
- Codex custom instructions with AGENTS.md: https://developers.openai.com/codex/guides/agents-md
- Codex best practices: https://developers.openai.com/codex/learn/best-practices

Notes:

- Keep `AGENTS.md` in the repo root for durable agent guidance.
- Give Codex small, testable tasks rather than one broad instruction.
- Ask Codex to run the relevant checks and report results for each implementation slice.
