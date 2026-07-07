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
      TokenPipeline.mdx
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

## Decorators

All stories should render inside `DemoThemeProvider`.

Example `preview.tsx`:

```tsx
import type { Preview } from '@storybook/react-vite';
import { DemoThemeProvider } from '@demo-ds/mantine-theme';
import '@demo-ds/mantine-theme/styles.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <DemoThemeProvider defaultColorScheme="light">
        <Story />
      </DemoThemeProvider>
    )
  ],
  parameters: {
    controls: { expanded: true }
  }
};

export default preview;
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

For the MVP, rendering both modes side by side is easiest and most reliable.

## Accessibility checks

Add Storybook accessibility tooling if desired. At minimum:

- Document expected keyboard behaviour.
- Use semantic HTML in stories.
- Avoid inaccessible example-only components.
- Include component tests outside Storybook.

## Visual regression

Optional after MVP:

- Use Playwright screenshots against built Storybook.
- Or integrate a hosted visual regression service.

Keep this optional until the pipeline and components are stable.

## Build command

```sh
pnpm --filter @demo-ds/storybook build
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

Suggested CI flow:

```txt
push to main -> install -> build packages -> build storybook -> upload static artifact -> deploy Pages
```

## Avoid these mistakes

- Do not manually copy token values into MDX.
- Do not import raw fixture files into Storybook.
- Do not bypass `DemoThemeProvider`.
- Do not import Mantine directly in stories or docs examples.
- Do not make Storybook the only consumer; keep the example app as a separate validation point.
