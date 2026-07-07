export const appSetupUsage = `import { DemoThemeProvider } from "@demo-ds/mantine-theme";
import { Button, Card, PageHeader } from "@demo-ds/components";
import "@demo-ds/mantine-theme/styles.css";

export function App() {
  return (
    <DemoThemeProvider defaultColorScheme="light">
      <PageHeader title="Project overview" />
      <Card>
        <Button>New item</Button>
      </Card>
    </DemoThemeProvider>
  );
}`;

export const componentUsage = `import {
  AlertBanner,
  Button,
  Card,
  PageHeader,
  StatusBadge,
  TextInput,
  ThemeToggle
} from "@demo-ds/components";

export function ProjectOverview() {
  return (
    <div>
      <PageHeader
        title="Project overview"
        description="Generic page content using package exports."
        actions={<Button>New item</Button>}
      />
      <Card>
        <TextInput
          label="Project name"
          helperText="Use a generic demo value."
          defaultValue="Demo project"
        />
      </Card>
      <AlertBanner tone="success" title="Saved">
        The demo configuration was saved.
      </AlertBanner>
      <StatusBadge tone="success">Live</StatusBadge>
      <ThemeToggle />
    </div>
  );
}`;
