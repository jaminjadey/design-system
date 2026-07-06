# 06 - Mantine theme generation

## Purpose

The Mantine theme package bridges canonical design tokens into Mantine's theming system. It should keep Mantine-specific choices outside the canonical token model.

Mantine's theme object is where application colours, fonts, spacing, radius, and related design tokens are stored. MantineProvider should be placed at the application root, where it provides the theme context and manages Mantine CSS variables.

## Package location

```txt
packages/mantine-theme/
  src/
    DemoThemeProvider.tsx
    cssVariablesResolver.ts
    generated/
      themeTokens.ts
    index.ts
    theme.ts
  tests/
  package.json
```

## Inputs

The package consumes generated outputs from `@demo-ds/tokens`:

```ts
import '@demo-ds/tokens/css';
import { tokens } from '@demo-ds/tokens';
```

It should not read raw fixture files.

## Outputs

The package exports:

```ts
export { demoTheme } from './theme';
export { demoCssVariablesResolver } from './cssVariablesResolver';
export { DemoThemeProvider } from './DemoThemeProvider';
```

## Mapping canonical tokens to Mantine

### Colours

Mantine colour palettes usually need arrays of shades. Map primitive colour groups into Mantine colour arrays.

Example:

```ts
export const demoTheme = createTheme({
  primaryColor: 'primary',
  colors: {
    primary: [
      '#ECFEFF',
      '#CFFAFE',
      '#A5F3FC',
      '#67E8F9',
      '#22D3EE',
      '#06B6D4',
      '#0891B2',
      '#0E7490',
      '#155E75',
      '#164E63'
    ]
  }
});
```

If the fixture shade names do not match Mantine's expected ten-step array perfectly, write a deterministic mapping function. Do not rely on object key insertion order.

### Semantic colours

Mantine's theme colour arrays are good for primitive palette scales. Semantic app-specific values should be exposed as CSS variables.

Example:

```css
.ds-page {
  color: var(--ds-color-text-default);
  background: var(--ds-color-background-page);
}
```

Provide semantic variables through generated CSS and, if useful, Mantine's CSS variables resolver.

### Spacing

Map canonical spacing values to Mantine spacing keys.

Example:

```ts
spacing: {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px'
}
```

The fixture has more scale steps than Mantine's core keys. Keep the complete scale available as CSS variables and map only the common subset to Mantine's named spacing slots.

### Radius

Map canonical radius values to Mantine radius keys:

```ts
radius: {
  xs: '2px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px'
}
```

Also keep the complete radius scale as CSS variables.

### Typography

Map heading tokens to Mantine headings:

```ts
headings: {
  fontFamily: defaultFontFamily,
  sizes: {
    h1: { fontSize: '32px', lineHeight: '40px', fontWeight: '700' },
    h2: { fontSize: '28px', lineHeight: '36px', fontWeight: '600' }
  }
}
```

Use a generic font stack. Do not include private font names or files.

Recommended generic font stack:

```ts
const defaultFontFamily = [
  'Inter',
  'ui-sans-serif',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'sans-serif'
].join(', ');
```

## DemoThemeProvider

Create a provider that imports Mantine styles, generated token CSS, and wraps children in `MantineProvider`.

Example:

```tsx
import '@mantine/core/styles.css';
import '@demo-ds/tokens/css';
import { MantineProvider } from '@mantine/core';
import { demoTheme } from './theme';
import { demoCssVariablesResolver } from './cssVariablesResolver';

export interface DemoThemeProviderProps {
  children: React.ReactNode;
  defaultColorScheme?: 'light' | 'dark' | 'auto';
}

export function DemoThemeProvider({ children, defaultColorScheme = 'light' }: DemoThemeProviderProps) {
  return (
    <MantineProvider
      theme={demoTheme}
      defaultColorScheme={defaultColorScheme}
      cssVariablesResolver={demoCssVariablesResolver}
    >
      {children}
    </MantineProvider>
  );
}
```

## CSS variables resolver

Use Mantine's CSS variables resolver only for values that should be attached to Mantine's provider lifecycle. Keep the generated `tokens.css` as the primary output for design-system semantic variables.

Recommended split:

| Output | Use |
| --- | --- |
| `@demo-ds/tokens/css` | Full design-system token variables. |
| `demoTheme` | Mantine-supported theme keys. |
| `demoCssVariablesResolver` | Additional app-level variables that should move with Mantine mode. |

## Component defaults

Component defaults should be defined in the theme only when they are global design-system decisions.

Example:

```ts
components: {
  Button: Button.extend({
    defaultProps: {
      radius: 'md'
    }
  })
}
```

Do not overload the theme with every component-specific decision. Keep complex component variants inside `@demo-ds/components`.

## Light and dark mode

Use Mantine's colour scheme support. The token CSS should target the same attribute Mantine uses:

```css
[data-mantine-color-scheme='light'] {
  --ds-color-text-default: #083344;
}

[data-mantine-color-scheme='dark'] {
  --ds-color-text-default: #fdfdfd;
}
```

The Storybook decorator and example app should both use `DemoThemeProvider` so mode behaviour is consistent.

## Tests

Test the Mantine theme package for:

- Theme object builds without throwing.
- Required colour palettes exist.
- Required spacing keys exist.
- Required radius keys exist.
- Heading mappings exist.
- Provider renders children.
- CSS resolver returns expected variable groups.
- No private font names appear.

## Avoid these mistakes

- Do not build the Mantine theme directly from raw fixtures.
- Do not hardcode source colour values in `theme.ts`.
- Do not add private fonts.
- Do not put application-specific copy into the theme package.
- Do not make components import from `packages/tokens/src`; use public package exports.
