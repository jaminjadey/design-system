# @demo-ds/mantine-theme

Internal theme adapter that maps generated design tokens into Mantine.

## Public Exports

- `DemoThemeProvider`: required provider for apps using the design-system components.
- `DemoColorScheme`: supported colour scheme type.
- `demoThemeSummary`: serialisable theme summary for docs and tests.
- `styles.css`: design-system CSS variables and Mantine baseline styles.

Apps should import the provider and stylesheet from this package. Apps should not
import Mantine components directly.

## Runtime Dependencies

React and React DOM are peer dependencies so the app owns the React runtime.
Mantine core and hooks are package dependencies because Mantine is an internal
implementation detail, not an app-facing API.
