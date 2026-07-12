import { NotificationBanner } from "./NotificationBanner.js";

const defaultSource = `import { NotificationBanner } from "@demo-ds/components";

export function Example() {
  return (
    <NotificationBanner title="Queued">
      The import report is ready for review.
    </NotificationBanner>
  );
}`;

const tonesSource = `import { NotificationBanner } from "@demo-ds/components";

export function Example() {
  return (
    <div>
      <NotificationBanner tone="info" title="Info">Ready to review.</NotificationBanner>
      <NotificationBanner tone="success" title="Success">Build complete.</NotificationBanner>
      <NotificationBanner tone="warning" title="Warning">Check mappings.</NotificationBanner>
      <NotificationBanner tone="danger" title="Danger">Import failed.</NotificationBanner>
    </div>
  );
}`;

export default {
  title: "Components/NotificationBanner",
  component: NotificationBanner,
  tags: ["autodocs"],
  args: {
    title: "Queued",
    children: "The import report is ready for review."
  }
};

export const Default = {
  parameters: {
    docs: {
      source: {
        code: defaultSource,
        language: "tsx"
      }
    }
  }
};

export const Tones = {
  parameters: {
    docs: {
      source: {
        code: tonesSource,
        language: "tsx"
      }
    }
  },
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-md)" }}>
      <NotificationBanner tone="default" title="Default">
        Generic update.
      </NotificationBanner>
      <NotificationBanner tone="info" title="Info">
        Ready to review.
      </NotificationBanner>
      <NotificationBanner tone="success" title="Success">
        Build complete.
      </NotificationBanner>
      <NotificationBanner tone="warning" title="Warning">
        Check mappings.
      </NotificationBanner>
      <NotificationBanner tone="danger" title="Danger">
        Import failed.
      </NotificationBanner>
    </div>
  )
};
