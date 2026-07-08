# 07 - React Components Package

## Purpose

The React component package is the app-facing design-system API. It may use
Mantine internally, but consumers should import components and types only from
`@demo-ds/components`.

This protects applications from being coupled to Mantine prop names, component
composition, or replacement cost. If the rendering layer changes later, the
design-system API can remain stable.

## Package Location

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

Story files can live in the component package and be consumed by the Storybook
app. For this demo, colocated stories are useful because each component has
implementation, tests, and docs together.

## API Strategy

Use the component package as an API firewall:

- App code imports `@demo-ds/components`.
- Component props use design-system names such as `tone`, `emphasis`, and `helperText`.
- Public props do not extend Mantine prop types.
- Mantine imports stay inside implementation files.
- Stories and examples should demonstrate design-system components, not direct Mantine usage.
- React is a peer dependency; Mantine is an implementation dependency owned by
  the design-system packages.

## Initial Component Set

### `Button`

Purpose:

- Demonstrate tone and emphasis mapping.
- Provide standard loading and icon spacing behaviour.
- Hide the underlying button implementation.

Suggested props:

```ts
export interface ButtonProps {
  children: React.ReactNode;
  tone?: "primary" | "neutral" | "danger" | "success";
  emphasis?: "high" | "medium" | "low";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}
```

### `TextInput`

Purpose:

- Demonstrate form field defaults.
- Standardise error/help text behaviour.
- Keep input API independent from Mantine.

Suggested props:

```ts
export interface TextInputProps {
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
}
```

### `AlertBanner`

Purpose:

- Demonstrate semantic status tokens.
- Provide accessible role and icon defaults.

Suggested props:

```ts
export interface AlertBannerProps {
  tone?: "info" | "success" | "warning" | "danger";
  title?: React.ReactNode;
  children: React.ReactNode;
}
```

### `Card`

Purpose:

- Demonstrate surface, border, radius, and spacing tokens.
- Provide an accessible interactive-card pattern when needed.

Suggested props:

```ts
export interface CardProps {
  children?: React.ReactNode;
  interactive?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}
```

### `StatusBadge`

Purpose:

- Demonstrate compact semantic status styling.

Suggested props:

```ts
export interface StatusBadgeProps {
  tone: "neutral" | "success" | "warning" | "danger" | "info";
  emphasis?: "soft" | "solid" | "outline";
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

- Demonstrate light/dark scheme integration through the design-system provider.

Use rendering-layer colour-scheme hooks internally, but do not expose them in
the public API.

## Styling Rules

- Use semantic CSS variables for colour decisions.
- Avoid hardcoded hex values.
- Avoid reaching into generated token internals.
- Use `var(--ds-...)` for design-system variables.
- Keep rendering-library props inside implementation files.

Example CSS:

```css
.root {
  background: var(--ds-color-background-card);
  color: var(--ds-color-text-default);
  border: 1px solid var(--ds-color-border-default);
  border-radius: var(--ds-radius-md);
}
```

## Accessibility Rules

- Buttons must have accessible names.
- Icon-only buttons must require `aria-label`.
- Alerts should use appropriate `role` values.
- Form fields should connect labels, descriptions, and errors.
- Interactive cards must be keyboard accessible or avoid pretending to be buttons.
- Do not remove focus indicators.

## Public Exports

The package root should export only public components and design-system-owned
types:

```ts
export { Button } from "./Button";
export type { ButtonProps } from "./Button";
export { AlertBanner } from "./AlertBanner";
export type { AlertBannerProps } from "./AlertBanner";
```

Do not export Mantine components, Mantine prop types, or internal utilities.

## Tests

Each component should have:

- Render test.
- Accessibility smoke test.
- Prop mapping test for important variants.
- Public declaration check to ensure no Mantine types leak from `dist`.

Example test goals:

```txt
Button renders children.
Button maps tone="danger" to danger styling.
Icon-only Button requires aria-label or test documents expected behaviour.
AlertBanner sets role="status" or role="alert" based on tone.
Generated component declarations do not import @mantine/core.
```

## Storybook Stories

Each component should have stories for:

- Default state.
- Variants.
- Sizes.
- Disabled/loading/error states where relevant.
- Light and dark backgrounds.
- Accessibility notes.

Stories should use design-system components and normal HTML/CSS for supporting
content rather than importing Mantine directly.

## Component Maturity Labels

Use maturity labels in docs:

| Label        | Meaning                      |
| ------------ | ---------------------------- |
| Experimental | API may change.              |
| Stable       | Safe for demo app usage.     |
| Deprecated   | Kept only for compatibility. |

For the initial repo, most components can be experimental except the provider
and token outputs.
