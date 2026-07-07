# 13 - Acceptance criteria

## MVP acceptance criteria

The MVP is complete when the repo can demonstrate the full path from demo token source files to app usage.

### Repo

- pnpm workspace is configured.
- Root scripts work: `build`, `test`, `lint`, `typecheck`.
- Package boundaries match the documented dependency direction.
- `AGENTS.md` exists.
- Docs explain the pipeline.

### Token source

- Demo token fixtures are committed in a clear fixture location.
- Token source scan passes.
- Fixture README explains synthetic nature.

### Canonical tokens

- Canonical token model exists.
- Canonical JSON is generated.
- Canonical JSON validates.
- Light and dark semantic tokens are merged.
- Typography tokens are grouped.
- Naming is stable and generic.

### Generated outputs

- CSS variables are generated.
- TypeScript exports are generated.
- Metadata is generated.
- Generated output is deterministic.
- Generated output is committed or verified according to repo policy.

### Mantine theme

- Mantine theme package builds.
- Provider works in Storybook and example app.
- Colours, spacing, radius, and typography are mapped.
- Semantic CSS variables are available.
- No private fonts or brand assets are used.

### Components

- At least five components exist.
- Components use Mantine and token variables.
- Components have tests.
- Components have Storybook stories.
- Components avoid hardcoded hex values.

### Storybook

- Storybook runs locally.
- Storybook builds in CI.
- Token pages render from generated data.
- Component stories render with the theme provider.
- Light/dark mode is demonstrated.

### Example app

- Example app runs locally.
- Example app builds in CI.
- App consumes packages via workspace dependencies.
- App demonstrates components and theme.
- App uses generic content.

### CI

- CI installs with frozen lockfile.
- CI runs safety scan.
- CI runs lint, typecheck, tests, and build.
- CI checks generated output drift.

## Full demo acceptance criteria

The full demo is complete when it is polished enough to showcase publicly.

Additional criteria:

- GitHub Pages Storybook deployment exists.
- README has screenshots or diagrams generated from public demo assets only.
- Storybook has high-quality MDX docs.
- Example app has at least three pages.
- Component accessibility notes are documented.
- Token docs include swatches and semantic tables.
- Release/versioning strategy is documented or implemented.
- Repo scan confirms no private markers.

## Quality bar

A reviewer should be able to answer these questions from the repo:

1. Where do source tokens come from?
2. How do we know they are safe fixtures?
3. What is the canonical token contract?
4. How are CSS variables generated?
5. How is the Mantine theme generated?
6. How do components consume the theme?
7. How does an app consume the packages?
8. What tests protect the pipeline?
9. How would this scale to a private production setup?

## Demo script

Suggested showcase flow:

1. Open repo README and explain architecture diagram.
2. Show demo token fixture files.
3. Run `pnpm tokens:scan`.
4. Run `pnpm tokens:build`.
5. Show `canonical.json` and generated CSS.
6. Show Mantine theme mapping.
7. Run Storybook and show token docs.
8. Show component stories.
9. Run example app and switch light/dark mode.
10. Open tests and CI workflow.

## What good looks like

The repo should feel like a miniature but credible design-system platform. It should be clear where real private integrations would plug in, while the public demo remains completely synthetic and safe.
