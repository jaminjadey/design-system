# Codex prompt 01 - Bootstrap monorepo

Use this prompt in Codex after creating an empty Git repository and copying in the documentation pack.

```txt
You are working in this repository. Follow AGENTS.md.

Read these files before editing:
- README.md
- docs/01-target-repo-structure.md
- docs/12-codex-work-plan.md

Task:
Bootstrap the pnpm monorepo for the demo design-system pipeline.

Create:
- pnpm-workspace.yaml
- root package.json
- turbo.json
- tsconfig.base.json
- packages/token-pipeline
- packages/tokens
- packages/mantine-theme
- packages/components
- apps/storybook
- apps/example

Set up basic TypeScript build/test/lint placeholders so the root commands exist:
- pnpm build
- pnpm test
- pnpm lint
- pnpm typecheck
- pnpm format:check

Use neutral package names:
- @demo-ds/token-pipeline
- @demo-ds/tokens
- @demo-ds/mantine-theme
- @demo-ds/components
- @demo-ds/storybook
- @demo-ds/example

Do not add raw private token files, brand-specific names, private fonts, or private assets.

Acceptance criteria:
- pnpm install succeeds.
- pnpm build succeeds, even if packages only have placeholders.
- pnpm test succeeds, even if tests are placeholders.
- pnpm lint succeeds.
- pnpm typecheck succeeds.
- Package dependency direction matches docs/01-target-repo-structure.md.

After implementation, run the relevant commands and report the results.
```
