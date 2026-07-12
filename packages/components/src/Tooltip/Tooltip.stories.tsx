import { Button } from "../Button/index.js";
import { Tooltip } from "./Tooltip.js";

const defaultSource = `import { Button, Tooltip } from "@demo-ds/components";

export function Example() {
  return (
    <Tooltip label="Create a generic item">
      <Button>New item</Button>
    </Tooltip>
  );
}`;

export default {
  title: "Components/Tooltip",
  component: Tooltip,
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
    <Tooltip label="Create a generic item" opened>
      <Button>New item</Button>
    </Tooltip>
  )
};
