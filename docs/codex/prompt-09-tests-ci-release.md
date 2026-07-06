# Codex prompt 09 - Tests, CI, and release hardening

```txt
You are working in this repository. Follow AGENTS.md.

Read these files before editing:
- docs/10-tests-and-quality-gates.md
- docs/11-ci-release-publishing.md
- docs/14-security-public-demo-rules.md

Task:
Add CI and harden the repo for public demonstration.

Implement:
- GitHub Actions CI workflow.
- Root repo-wide forbidden marker scan if not already present.
- Generated output drift check.
- Storybook build in CI.
- Example app build in CI.
- Package export checks if practical.
- README updates explaining local commands.
- Optional Changesets setup only if it does not distract from MVP.

Acceptance criteria:
- CI workflow runs install, safety scan, lint, typecheck, test, build, and drift check.
- Public README explains how to run the repo.
- No forbidden assets or raw files are present.
- Package scripts are consistent.
- Repo is ready to push to GitHub.

Run locally:
- pnpm install --frozen-lockfile
- pnpm tokens:scan
- pnpm lint
- pnpm typecheck
- pnpm test
- pnpm build
- git diff --exit-code

Report results and any remaining manual GitHub setup needed.
```
