# 01 - Target repo structure

## Recommended structure

```txt
repo-root/
  apps/
    example/
      src/
      package.json
      vite.config.ts
    storybook/
      .storybook/
      src/
      package.json
  packages/
    token-pipeline/
      src/
      tests/
      package.json
    tokens/
      fixtures/
      src/
      generated/
      dist/
      package.json
    mantine-theme/
      src/
      tests/
      package.json
    components/
      src/
      tests/
      package.json
  docs/
  AGENTS.md
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
```

## Package responsibilities

### `packages/token-pipeline`

Private package containing the build logic.

Responsibilities:

- Read extracted sanitised fixture token files.
- Validate allowed source files and directories.
- Scan for forbidden terms and source-tool metadata.
- Normalise token names.
- Convert source token values into canonical values.
- Merge light and dark semantic token sets.
- Generate output files for other packages.
- Provide unit-tested utility functions.

Public surface:

```ts
export function buildCanonicalTokens(options: BuildOptions): CanonicalTokenDocument;
export function generateTokenOutputs(document: CanonicalTokenDocument, options: OutputOptions): void;
```

This package can remain private because consumers should use generated packages, not generator internals.

### `packages/tokens`

Public-consumable package containing generated token outputs.

Responsibilities:

- Store the sanitised fixture zip or extracted fixture files.
- Expose generated canonical JSON.
- Expose generated CSS variables.
- Expose generated TypeScript token maps and types.
- Expose a build script that calls `@demo-ds/token-pipeline`.

Suggested exports:

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./canonical.json": "./dist/canonical.json",
    "./css": "./dist/tokens.css",
    "./metadata.json": "./dist/metadata.json"
  }
}
```

### `packages/mantine-theme`

Package that maps generated tokens to Mantine.

Responsibilities:

- Import generated tokens from `@demo-ds/tokens`.
- Export a Mantine theme object.
- Export semantic CSS variable resolver or CSS file.
- Export a `DemoThemeProvider` that wraps `MantineProvider`.
- Keep font handling generic with safe fallback fonts.

Suggested exports:

```ts
export { demoTheme } from './theme';
export { demoCssVariablesResolver } from './cssVariablesResolver';
export { DemoThemeProvider } from './DemoThemeProvider';
```

### `packages/components`

React component package built on Mantine and the generated theme.

Responsibilities:

- Export reusable design-system components.
- Encode design-system variants, defaults, and accessibility patterns.
- Avoid hardcoded source colours.
- Keep implementation generic and reusable.

Initial components:

- `Button`
- `TextInput`
- `AlertBanner`
- `Card`
- `StatusBadge`
- `PageHeader`
- `ThemeToggle`
- `StackedForm`

### `apps/storybook`

Storybook documentation app.

Responsibilities:

- Show token swatches and scales.
- Show generated Mantine theme values.
- Show components and variants.
- Provide usage docs and accessibility notes.
- Serve as the public design-system showcase.

### `apps/example`

Example Vite React app consuming the packages.

Responsibilities:

- Use `@demo-ds/mantine-theme` and `@demo-ds/components` as dependencies.
- Demonstrate light/dark mode.
- Demonstrate realistic but generic screens.
- Avoid importing package internals.

## Dependency direction

Keep dependencies flowing in one direction:

```mermaid
flowchart TD
  pipeline[@demo-ds/token-pipeline] --> tokens[@demo-ds/tokens]
  tokens --> theme[@demo-ds/mantine-theme]
  theme --> components[@demo-ds/components]
  tokens --> storybook[@demo-ds/storybook]
  theme --> storybook
  components --> storybook
  theme --> example[@demo-ds/example]
  components --> example
```

Avoid reverse dependencies. For example, `@demo-ds/tokens` must not import `@demo-ds/mantine-theme`, and packages must not import from apps.

## Workspace naming

Use a neutral package scope. Example:

```txt
@demo-ds/token-pipeline
@demo-ds/tokens
@demo-ds/mantine-theme
@demo-ds/components
@demo-ds/storybook
@demo-ds/example
```

## Root scripts

Root scripts should orchestrate package scripts rather than containing implementation logic:

```json
{
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "format": "prettier . --check",
    "format:write": "prettier . --write",
    "storybook": "pnpm --filter @demo-ds/storybook storybook"
  }
}
```

## Why this structure works

- The token pipeline is isolated and testable.
- Generated assets are separated from generator code.
- Mantine-specific mapping is not mixed into canonical token generation.
- Components consume theme outputs like real downstream users would.
- Storybook and example app validate the packages from the outside.
