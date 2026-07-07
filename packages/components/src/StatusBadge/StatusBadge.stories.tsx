import { StatusBadge } from "./StatusBadge.js";

export default {
  title: "Components/StatusBadge",
  component: StatusBadge,
  args: {
    tone: "info",
    children: "In review"
  }
};

export const Default = {};

export const Tones = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--ds-space-sm)", flexWrap: "wrap" }}>
      <StatusBadge tone="neutral">Draft</StatusBadge>
      <StatusBadge tone="info">In review</StatusBadge>
      <StatusBadge tone="success">Live</StatusBadge>
      <StatusBadge tone="warning">Needs attention</StatusBadge>
      <StatusBadge tone="danger">Blocked</StatusBadge>
    </div>
  )
};
