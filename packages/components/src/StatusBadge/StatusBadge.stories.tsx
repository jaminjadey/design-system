import { StatusBadge } from "./StatusBadge.js";

const defaultSource = `import { StatusBadge } from "@demo-ds/components";

export function Example() {
  return <StatusBadge tone="info">In review</StatusBadge>;
}`;

const tonesSource = `import { StatusBadge } from "@demo-ds/components";

export function Example() {
  return (
    <div>
      <StatusBadge tone="neutral">Draft</StatusBadge>
      <StatusBadge tone="info">In review</StatusBadge>
      <StatusBadge tone="success">Live</StatusBadge>
      <StatusBadge tone="warning">Needs attention</StatusBadge>
      <StatusBadge tone="danger">Blocked</StatusBadge>
    </div>
  );
}`;

export default {
  title: "Components/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  args: {
    tone: "info",
    children: "In review"
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
    <div style={{ display: "flex", gap: "var(--ds-space-sm)", flexWrap: "wrap" }}>
      <StatusBadge tone="neutral">Draft</StatusBadge>
      <StatusBadge tone="info">In review</StatusBadge>
      <StatusBadge tone="success">Live</StatusBadge>
      <StatusBadge tone="warning">Needs attention</StatusBadge>
      <StatusBadge tone="danger">Blocked</StatusBadge>
    </div>
  )
};
