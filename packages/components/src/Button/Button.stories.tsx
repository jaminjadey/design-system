import { Button } from "./Button.js";

export default {
  title: "Components/Button",
  component: Button,
  args: {
    children: "Save changes"
  }
};

export const Default = {};

export const Tones = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--ds-space-md)", flexWrap: "wrap" }}>
      <Button tone="primary">Primary</Button>
      <Button tone="neutral">Neutral</Button>
      <Button tone="success">Success</Button>
      <Button tone="danger">Danger</Button>
    </div>
  )
};

export const Emphasis = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--ds-space-md)", flexWrap: "wrap" }}>
      <Button emphasis="high">High</Button>
      <Button emphasis="medium">Medium</Button>
      <Button emphasis="low">Low</Button>
    </div>
  )
};

export const Loading = {
  args: {
    loading: true,
    children: "Saving"
  }
};
