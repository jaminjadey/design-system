import { Button } from "./Button.js";

const defaultSource = `import { Button } from "@demo-ds/components";

export function Example() {
  return <Button>Save changes</Button>;
}`;

const tonesSource = `import { Button } from "@demo-ds/components";

export function Example() {
  return (
    <div>
      <Button tone="primary">Primary</Button>
      <Button tone="neutral">Neutral</Button>
      <Button tone="success">Success</Button>
      <Button tone="danger">Danger</Button>
    </div>
  );
}`;

const emphasisSource = `import { Button } from "@demo-ds/components";

export function Example() {
  return (
    <div>
      <Button emphasis="high">High</Button>
      <Button emphasis="medium">Medium</Button>
      <Button emphasis="low">Low</Button>
    </div>
  );
}`;

const loadingSource = `import { Button } from "@demo-ds/components";

export function Example() {
  return <Button loading>Saving</Button>;
}`;

export default {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Save changes"
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
    <div style={{ display: "flex", gap: "var(--ds-space-md)", flexWrap: "wrap" }}>
      <Button tone="primary">Primary</Button>
      <Button tone="neutral">Neutral</Button>
      <Button tone="success">Success</Button>
      <Button tone="danger">Danger</Button>
    </div>
  )
};

export const Emphasis = {
  parameters: {
    docs: {
      source: {
        code: emphasisSource,
        language: "tsx"
      }
    }
  },
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
  },
  parameters: {
    docs: {
      source: {
        code: loadingSource,
        language: "tsx"
      }
    }
  }
};
