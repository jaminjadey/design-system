import { AlertBanner } from "./AlertBanner.js";

const infoSource = `import { AlertBanner } from "@demo-ds/components";

export function Example() {
  return (
    <AlertBanner tone="info" title="Status update">
      The request was received and is being processed.
    </AlertBanner>
  );
}`;

const statusTonesSource = `import { AlertBanner } from "@demo-ds/components";

export function Example() {
  return (
    <div>
      <AlertBanner tone="info" title="Info">
        New project settings are available.
      </AlertBanner>
      <AlertBanner tone="success" title="Success">
        The configuration was saved.
      </AlertBanner>
      <AlertBanner tone="warning" title="Warning">
        Review the changes before publishing.
      </AlertBanner>
      <AlertBanner tone="danger" title="Danger">
        The action could not be completed.
      </AlertBanner>
    </div>
  );
}`;

export default {
  title: "Components/AlertBanner",
  component: AlertBanner,
  tags: ["autodocs"],
  args: {
    title: "Status update",
    children: "The request was received and is being processed."
  }
};

export const Info = {
  parameters: {
    docs: {
      source: {
        code: infoSource,
        language: "tsx"
      }
    }
  }
};

export const StatusTones = {
  parameters: {
    docs: {
      source: {
        code: statusTonesSource,
        language: "tsx"
      }
    }
  },
  render: () => (
    <div style={{ display: "grid", gap: "var(--ds-space-md)" }}>
      <AlertBanner tone="info" title="Info">
        New project settings are available.
      </AlertBanner>
      <AlertBanner tone="success" title="Success">
        The configuration was saved.
      </AlertBanner>
      <AlertBanner tone="warning" title="Warning">
        Review the changes before publishing.
      </AlertBanner>
      <AlertBanner tone="danger" title="Danger">
        The action could not be completed.
      </AlertBanner>
    </div>
  )
};
