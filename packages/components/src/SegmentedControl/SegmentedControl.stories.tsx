import { SegmentedControl } from "./SegmentedControl.js";

const options = [
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity" },
  { value: "settings", label: "Settings" }
];

const defaultSource = `import { SegmentedControl } from "@demo-ds/components";

const options = [
  { value: "overview", label: "Overview" },
  { value: "activity", label: "Activity" },
  { value: "settings", label: "Settings" }
];

export function Example() {
  return <SegmentedControl label="View" data={options} defaultValue="overview" />;
}`;

export default {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  argTypes: {
    data: {
      control: false
    }
  },
  args: {
    label: "View",
    data: options,
    defaultValue: "overview"
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
