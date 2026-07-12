import { LoadingSpinner } from "./LoadingSpinner.js";

const defaultSource = `import { LoadingSpinner } from "@demo-ds/components";

export function Example() {
  return <LoadingSpinner label="Loading report" />;
}`;

export default {
  title: "Components/LoadingSpinner",
  component: LoadingSpinner,
  tags: ["autodocs"],
  args: {
    label: "Loading report"
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

export const Sizes = {
  render: () => (
    <div style={{ display: "flex", gap: "var(--ds-space-lg)", flexWrap: "wrap" }}>
      <LoadingSpinner size="sm" label="Small" />
      <LoadingSpinner size="md" label="Medium" />
      <LoadingSpinner size="lg" label="Large" />
    </div>
  )
};
