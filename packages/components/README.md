# @demo-ds/components

Public React component API for the demo design system.

## Public Exports

- `AlertBanner`
- `Button`
- `Card`
- `PageHeader`
- `StatusBadge`
- `TextInput`
- `ThemeToggle`

Components encode design-system decisions and use semantic token names. Mantine
is an internal rendering layer and should not be imported directly by app code.
For example, `Card` consumes semantic surface, border, radius, and shadow tokens
instead of hardcoded visual values.

## Runtime Dependencies

React and React DOM are peer dependencies so the app owns the React runtime.
Mantine core and hooks are package dependencies owned by the design-system
packages, so app code does not depend on Mantine directly.
