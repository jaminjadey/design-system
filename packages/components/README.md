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

Components encode design-system decisions and use generated token variables.
Mantine is an internal rendering layer and should not be imported directly by
app code. Broad layout values use semantic tokens; component-specific variants
and states use `--ds-component-*` variables generated from `component.*` tokens.

## Runtime Dependencies

React and React DOM are peer dependencies so the app owns the React runtime.
Mantine core and hooks are package dependencies owned by the design-system
packages, so app code does not depend on Mantine directly.
