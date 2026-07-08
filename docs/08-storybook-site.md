# 08 - Storybook site

## Purpose

Storybook is the public design-system showcase. It should document the token pipeline, theme, components, and usage patterns in one place.

Storybook for React with Vite is a good fit because the example app and packages can share the Vite/React toolchain.

## App location

```txt
apps/storybook/
  .storybook/
    main.ts
    preview.tsx
  src/
    docs/
      Introduction.mdx
      GettingStarted.mdx
      TokenPipeline.mdx
      UsingTokens.mdx
      UsingComponents.mdx
      ReplacingDemoTokens.mdx
      TokenNamingRules.mdx
      PipelineOutputContract.mdx
      WhatAppsShouldImport.mdx
      Theme.mdx
    token-pages/
      ColorTokensPage.tsx
      SpacingTokensPage.tsx
      TypographyTokensPage.tsx
  package.json
```

## Storybook responsibilities

- Render component stories.
- Render token documentation from generated token docs data.
- Show light/dark mode behaviour.
- Explain how the pipeline works.
- Provide copy-paste usage examples.
- Demonstrate the example package consumption pattern.

## Theme setup

All stories and MDX docs should render inside `DemoThemeProvider`. The preview
configuration should also set `data-mantine-color-scheme` on the document so
token CSS variables, docs pages, and component stories switch mode together.

The Storybook preview owns this setup:

```txt
apps/storybook/.storybook/preview.tsx
```

## Story discovery

If stories are colocated in packages:

```ts
const config = {
  stories: [
    '../../../packages/components/src/**/*.stories.@(ts|tsx|mdx)',
    '../src/**/*.mdx'
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  }
};

export default config;
```

## Documentation pages

Create these docs pages:

### Introduction

Explain:

- What this design-system demo is.
- What it is not.
- How to run it locally.
- How packages relate to each other.

### Token pipeline

Show:

- Source fixture structure.
- Safety scan.
- Canonical model.
- Generated outputs.
- Build commands.

### Colours

Render from `token-docs.json`:

- Primitive palettes.
- Semantic light/dark token table.
- CSS variable names.
- Contrast notes where available.

### Spacing and radius

Render:

- Scale values.
- CSS variable names.
- Visual examples.

### Typography

Render:

- Heading styles.
- Body styles.
- Font size, line height, weight.
- Generic font-stack note.

### Components

For each component:

- Overview.
- Props.
- Variants.
- Accessibility notes.
- Usage examples.

## Token docs rendering

Do not duplicate token values manually in MDX. Import generated data:

```tsx
import tokenDocs from '@demo-ds/tokens/token-docs.json';
```

Use reusable token-table components:

```txt
ColorSwatchTable
SemanticColorTable
SpacingScaleTable
RadiusScaleTable
TypographyTable
```

## Light/dark mode support

Storybook should make colour scheme switching obvious.

Options:

1. Add a toolbar global for colour scheme.
2. Add stories that render both modes side by side.
3. Add a `ThemeToggle` component in docs pages.

Use a toolbar global for light/dark mode, and keep token documentation pages
styled with generated `--ds-*` variables so the docs surface changes with the
selected mode.

## Accessibility checks

Storybook uses `@storybook/addon-a11y` and a Playwright smoke test against the
built static site. At minimum:

- Document expected keyboard behaviour.
- Use semantic HTML in stories.
- Avoid inaccessible example-only components.
- Include component tests outside Storybook.
- Check key docs and component pages in light and dark modes.

## Visual regression

Optional after MVP:

- Use Playwright screenshots against built Storybook.
- Or integrate a hosted visual regression service.

Keep this optional until the pipeline and components are stable.

## Build command

```sh
pnpm --filter @demo-ds/storybook build
```

## Smoke test command

```sh
pnpm --filter @demo-ds/storybook test
```

## Local command

```sh
pnpm storybook
```

or:

```sh
pnpm --filter @demo-ds/storybook storybook
```

## Deployment

For a public demo, deploy the built Storybook to GitHub Pages.

Workflow:

```txt
.github/workflows/storybook-pages.yml
```

Flow:

```txt
push to main -> install -> scan fixtures -> build workspace -> upload static artifact -> deploy Pages
```

Published URL:

```txt
https://jaminjadey.github.io/design-system/
```
```

## Avoid these mistakes

- Do not manually copy token values into MDX.
- Do not import raw fixture files into Storybook.
- Do not bypass `DemoThemeProvider`.
- Do not import Mantine directly in stories or docs examples.
- Do not make Storybook the only consumer; keep the example app as a separate validation point.
