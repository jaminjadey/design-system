import { Card } from "./Card.js";

const defaultSource = `import { Card } from "@demo-ds/components";

export function Example() {
  return (
    <Card>
      <strong>Project summary</strong>
      <p>A compact surface for related content.</p>
    </Card>
  );
}`;

const interactiveSource = `import { Card } from "@demo-ds/components";

export function Example() {
  return (
    <Card interactive onClick={() => undefined}>
      <strong>Open details</strong>
      <p>Keyboard and pointer users can activate this card.</p>
    </Card>
  );
}`;

export default {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"]
};

export const Default = {
  parameters: {
    docs: {
      source: {
        code: defaultSource,
        language: "tsx"
      }
    }
  },
  render: () => (
    <Card>
      <strong>Project summary</strong>
      <p>A compact surface for related content.</p>
    </Card>
  )
};

export const Interactive = {
  parameters: {
    docs: {
      source: {
        code: interactiveSource,
        language: "tsx"
      }
    }
  },
  render: () => (
    <Card interactive onClick={() => undefined}>
      <strong>Open details</strong>
      <p>Keyboard and pointer users can activate this card.</p>
    </Card>
  )
};
