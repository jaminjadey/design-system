# @demo-ds/mantine-theme

Internal theme adapter that maps generated design tokens into Mantine.

## Public Exports

- `DemoThemeProvider`: required provider for apps using the design-system components.
- `DemoColorScheme`: supported colour scheme type.
- `demoThemeSummary`: serialisable theme summary for docs and tests.
- `styles.css`: design-system CSS variables and Mantine baseline styles.

Apps should import the provider and stylesheet from this package. Apps should not
import Mantine components directly.

## Peer Dependencies

React, React DOM, Mantine core, and Mantine hooks are peer dependencies so the
app owns one runtime copy. They are implementation peers, not app-facing APIs.
