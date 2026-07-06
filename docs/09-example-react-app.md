# 09 - Example React app

## Purpose

The example app proves that the generated packages can be consumed by a normal React application.

The example app should not reach into package internals. It should use package exports the same way an external consumer would.

## App location

```txt
apps/example/
  src/
    App.tsx
    main.tsx
    pages/
      DashboardPage.tsx
      FormsPage.tsx
      SettingsPage.tsx
    components/
      DemoShell.tsx
  package.json
  vite.config.ts
```

## Dependencies

```json
{
  "dependencies": {
    "@demo-ds/components": "workspace:*",
    "@demo-ds/mantine-theme": "workspace:*",
    "@demo-ds/tokens": "workspace:*",
    "@mantine/core": "latest",
    "@mantine/hooks": "latest",
    "@vitejs/plugin-react": "latest",
    "react": "latest",
    "react-dom": "latest"
  }
}
```

Pin exact versions during implementation after install. Avoid leaving floating `latest` in committed `package.json` if reproducible builds matter.

## Provider setup

`main.tsx` should wrap the app once:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { DemoThemeProvider } from '@demo-ds/mantine-theme';
import { App } from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DemoThemeProvider defaultColorScheme="light">
      <App />
    </DemoThemeProvider>
  </React.StrictMode>
);
```

## Demo pages

Use generic application examples. Avoid banking-specific content.

### Dashboard page

Show:

- `PageHeader`
- `Card`
- `StatusBadge`
- `AlertBanner`
- Button variants

Generic content examples:

- Project health.
- Task completion.
- Service status.
- Upcoming actions.

### Forms page

Show:

- `TextInput`
- Validation state.
- Help text.
- Submit/cancel buttons.
- Alert on success.

Generic content examples:

- Profile settings.
- Notification preferences.
- Support request.

### Settings page

Show:

- Theme toggle.
- Density or layout examples if implemented.
- Typography examples.
- Token-driven surfaces.

## App shell

Use Mantine layout primitives or a simple custom shell. Keep it generic.

Suggested nav:

```txt
Overview
Forms
Settings
Tokens
```

## What the app should prove

- Packages can be consumed through workspace dependencies.
- Mantine theme works in a real app.
- CSS variables are available at runtime.
- Components render in light and dark modes.
- Bundling works outside Storybook.
- No raw token imports are needed.

## Build command

```sh
pnpm --filter @demo-ds/example build
```

## Dev command

```sh
pnpm --filter @demo-ds/example dev
```

## Test command

```sh
pnpm --filter @demo-ds/example test
```

## Example app tests

Keep these light:

- App renders.
- Main navigation renders.
- Theme provider does not crash.
- At least one component from `@demo-ds/components` renders.

Deep component tests belong in the component package.

## Avoid these mistakes

- Do not import from `packages/components/src`.
- Do not hardcode token values in app CSS.
- Do not add product-specific copy.
- Do not use the app as the only documentation; Storybook remains the design-system site.
