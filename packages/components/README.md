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

## Peer Dependencies

React, React DOM, Mantine core, and Mantine hooks are peer dependencies so the
theme provider and components share one runtime context.
