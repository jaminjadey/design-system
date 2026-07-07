# 11 - CI, release, and package management

## CI goals

CI should prove the repo is reproducible from a fresh checkout.

Required CI stages:

1. Install dependencies.
2. Run safety scan.
3. Run lint.
4. Run typecheck.
5. Run tests.
6. Build packages.
7. Build Storybook.
8. Build example app.
9. Verify generated output has no uncommitted diff.

## GitHub Actions workflow

Suggested file:

```txt
.github/workflows/ci.yml
```

Suggested shape:

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm tokens:scan
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
      - run: git diff --exit-code
```

## Storybook deployment

Deploy built Storybook to GitHub Pages from `main`.

Workflow:

```txt
.github/workflows/storybook-pages.yml
```

Flow:

```txt
install -> scan fixtures -> build workspace -> upload artifact -> deploy Pages
```

Published URL:

```txt
https://jaminjadey.github.io/design-system/
```

Keep deployment separate from pull request CI if you want faster PR feedback.

## Package versioning

For the demo, there are two reasonable options:

### Option A: Workspace-only packages

Use packages only inside the repo.

Pros:

- Simpler.
- No npm publishing setup.
- Good enough for a demo app and Storybook.

Cons:

- Does not demonstrate external package publishing.

### Option B: Publishable demo packages

Use Changesets for versioning and changelogs.

Pros:

- Demonstrates a real design-system package workflow.
- Makes package boundaries more meaningful.

Cons:

- Requires npm scope and release process.
- More setup.

Recommended path: start with Option A. Add Changesets later.

## Changesets package model

If using Changesets, version these packages:

```txt
@demo-ds/tokens
@demo-ds/mantine-theme
@demo-ds/components
```

Keep these private:

```txt
@demo-ds/token-pipeline
@demo-ds/storybook
@demo-ds/example
```

## Release quality gates

Before publishing packages:

- Build all packages.
- Run all tests.
- Verify generated outputs.
- Verify package exports.
- Verify no forbidden markers.
- Verify package tarballs do not contain fixture zip unless intended.
- Verify Storybook still builds.

## Package contents

Use `files` in package manifests to avoid publishing source clutter.

Example:

```json
{
  "files": [
    "dist",
    "README.md",
    "package.json"
  ]
}
```

For `@demo-ds/tokens`, include generated output, not raw source fixtures, if publishing externally.

## Versioning guidelines

| Change | Version impact |
| --- | --- |
| Add token | Minor |
| Remove token | Major |
| Rename token | Major |
| Change token value | Patch or minor, depending on policy |
| Add component | Minor |
| Remove component prop | Major |
| Fix component bug | Patch |

For a demo repo, exact semver policy is less important than showing that the policy exists.

## Branch strategy

Simple strategy:

```txt
main: always green and deployable
feature branches: implementation tasks
pull requests: reviewed changes with passing CI
```

## Generated artifacts in Git

Commit generated artifacts for demo transparency and reproducibility.

Rationale:

- Reviewers can inspect generated output without running scripts.
- CI can detect drift.
- Storybook and example app builds are easier to debug.

Counterpoint: in some production repos generated artifacts are not committed. For this demo, committing them is useful.

## Dependency hygiene

- Pin dependency versions through the lockfile.
- Avoid unnecessary dependencies.
- Add a dependency only when it has a clear job.
- Keep generator dependencies out of runtime packages where possible.
- Keep rendering-library dependencies inside the design-system packages so apps consume `@demo-ds/*`, not Mantine directly.

## Runtime package dependencies

For this demo, `@demo-ds/mantine-theme` and `@demo-ds/components` own the Mantine implementation dependency:

```json
{
  "dependencies": {
    "@mantine/core": "^9",
    "@mantine/hooks": "^9"
  }
}
```

If these packages are published later, decide deliberately whether React stays a peer dependency. Mantine should remain hidden from app-level imports unless the design-system API explicitly changes.
