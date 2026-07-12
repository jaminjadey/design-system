export const appSetupUsage = `import { DemoThemeProvider } from "@demo-ds/mantine-theme";
import { Button, Card, PageHeader, Select } from "@demo-ds/components";
import "@demo-ds/mantine-theme/styles.css";

export function App() {
  return (
    <DemoThemeProvider defaultColorScheme="light">
      <PageHeader title="Project overview" />
      <Card>
        <Button>New item</Button>
        <Select
          label="Status"
          data={[
            { value: "draft", label: "Draft" },
            { value: "live", label: "Live" }
          ]}
        />
      </Card>
    </DemoThemeProvider>
  );
}`;

export const componentUsage = `import {
  AlertBanner,
  Button,
  Card,
  DatePicker,
  LoadingSpinner,
  NotificationBanner,
  PageHeader,
  SegmentedControl,
  Select,
  StatusBadge,
  TextInput,
  ThemeToggle,
  Tooltip
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
      <Select
        label="Status"
        data={[
          { value: "draft", label: "Draft" },
          { value: "review", label: "In review" },
          { value: "live", label: "Live" }
        ]}
        defaultValue="review"
      />
      <SegmentedControl
        label="View"
        data={[
          { value: "overview", label: "Overview" },
          { value: "activity", label: "Activity" },
          { value: "settings", label: "Settings" }
        ]}
        defaultValue="overview"
      />
      <DatePicker label="Target date" defaultValue="2026-07-13" />
      <AlertBanner tone="success" title="Saved">
        The demo configuration was saved.
      </AlertBanner>
      <NotificationBanner tone="info" title="Import report">
        Synthetic component tokens generated successfully.
      </NotificationBanner>
      <StatusBadge tone="success">Live</StatusBadge>
      <Tooltip label="Create a generic item">
        <Button>New item</Button>
      </Tooltip>
      <LoadingSpinner label="Loading report" />
      <ThemeToggle />
    </div>
  );
}`;
