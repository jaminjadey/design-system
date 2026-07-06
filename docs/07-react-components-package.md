# 07 - React components package

## Purpose

The React component package demonstrates how product teams would consume the design system. It should be built on Mantine but expose a design-system API where useful.

The package should not wrap every Mantine component. Wrap Mantine components only when the wrapper adds meaningful design-system value.

## Package location

```txt
packages/components/
  src/
    Button/
      Button.tsx
      Button.test.tsx
      Button.stories.tsx
      index.ts
    AlertBanner/
    Card/
    PageHeader/
    StatusBadge/
    TextInput/
    ThemeToggle/
    index.ts
  package.json
```

Story files can live in the component package and be consumed by the Storybook app, or they can live in the Storybook app. For a demo repo, colocated stories are useful because each component has implementation, tests, and docs together.

## Component strategy

Use three levels of component abstraction:

### 1. Theme-first Mantine usage

For simple cases, consumers can use Mantine components directly under `DemoThemeProvider`.

Example:

```tsx
import { Button } from '@mantine/core';

<Button variant="filled">Save</Button>
```

### 2. Thin design-system wrappers

Use wrappers when default props, variants, naming, or accessibility behaviour should be standardised.

Example:

```tsx
import { Button } from '@demo-ds/components';

<Button tone="primary">Save</Button>
```

### 3. Composed application patterns

Use composed components for repeated patterns.

Examples:

- `AlertBanner`
- `PageHeader`
- `EmptyState`
- `FormSection`
- `DataCard`

## Initial component set

### `Button`

Purpose:

- Demonstrate tone and variant mapping.
- Provide standard loading and icon spacing behaviour.

Suggested props:

```ts
export interface ButtonProps extends Omit<MantineButtonProps, 'color'> {
  tone?: 'primary' | 'neutral' | 'danger' | 'success';
  emphasis?: 'high' | 'medium' | 'low';
}
```

Mapping:

| `tone` | Mantine colour or CSS variable |
| --- | --- |
| `primary` | `primary` |
| `neutral` | semantic neutral styling |
| `danger` | danger palette or semantic danger variable |
| `success` | success palette or semantic success variable |

### `TextInput`

Purpose:

- Demonstrate form field defaults.
- Standardise error/help text behaviour.

Suggested props:

```ts
export interface TextInputProps extends MantineTextInputProps {
  helperText?: React.ReactNode;
}
```

### `AlertBanner`

Purpose:

- Demonstrate semantic status tokens.
- Provide accessible role and icon defaults.

Suggested props:

```ts
export interface AlertBannerProps {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: React.ReactNode;
  children: React.ReactNode;
}
```

### `Card`

Purpose:

- Demonstrate surface, border, radius, and spacing tokens.

Suggested props:

```ts
export interface CardProps extends MantinePaperProps {
  interactive?: boolean;
}
```

### `StatusBadge`

Purpose:

- Demonstrate compact semantic status styling.

Suggested props:

```ts
export interface StatusBadgeProps {
  tone: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}
```

### `PageHeader`

Purpose:

- Demonstrate layout and typography tokens.

Suggested props:

```ts
export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}
```

### `ThemeToggle`

Purpose:

- Demonstrate light/dark scheme integration.

Use Mantine colour-scheme hooks internally.

## Styling rules

- Prefer Mantine props for standard component variations.
- Use CSS modules for custom styles.
- Use semantic CSS variables for colour decisions.
- Avoid hardcoded hex values.
- Avoid reaching into generated token internals.
- Use `var(--ds-...)` for design-system variables.

Example CSS module:

```css
.root {
  background: var(--ds-color-background-card);
  color: var(--ds-color-text-default);
  border: 1px solid var(--ds-color-border-default);
  border-radius: var(--ds-radius-md);
}
```

## Accessibility rules

- Buttons must have accessible names.
- Icon-only buttons must require `aria-label`.
- Alerts should use appropriate `role` values.
- Form fields should connect labels, descriptions, and errors.
- Interactive cards must be keyboard accessible or avoid pretending to be buttons.
- Do not remove focus indicators.

## Public exports

The package root should export only public components and types:

```ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
export { AlertBanner } from './AlertBanner';
export type { AlertBannerProps } from './AlertBanner';
```

Do not export internal utilities unless they are intended to be stable.

## Tests

Each component should have:

- Render test.
- Accessibility smoke test.
- Prop mapping test for important variants.
- Snapshot only where useful.

Example test goals:

```txt
Button renders children.
Button maps tone="danger" to danger styling.
Icon-only Button requires aria-label or test documents expected behaviour.
AlertBanner sets role="status" or role="alert" based on tone.
```

## Storybook stories

Each component should have stories for:

- Default state.
- Variants.
- Sizes.
- Disabled/loading/error states where relevant.
- Light and dark backgrounds.
- Accessibility notes.

## Component maturity labels

Use maturity labels in docs:

| Label | Meaning |
| --- | --- |
| Experimental | API may change. |
| Stable | Safe for demo app usage. |
| Deprecated | Kept only for compatibility. |

For the initial repo, most components can be experimental except the provider and token outputs.
