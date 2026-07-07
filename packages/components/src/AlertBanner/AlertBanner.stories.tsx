import { AlertBanner } from "./AlertBanner.js";

export default {
  title: "Components/AlertBanner",
  component: AlertBanner,
  args: {
    title: "Status update",
    children: "The request was received and is being processed."
  }
};

export const Info = {};

export const StatusTones = {
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
