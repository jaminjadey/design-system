import { Select } from "./Select.js";

const options = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "live", label: "Live" }
];

const defaultSource = `import { Select } from "@demo-ds/components";

const options = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "In review" },
  { value: "live", label: "Live" }
];

export function Example() {
  return <Select label="Status" data={options} defaultValue="review" />;
}`;

export default {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  argTypes: {
    data: {
      control: false
    }
  },
  args: {
    label: "Status",
    data: options,
    defaultValue: "review",
    helperText: "Choose a generic workflow state."
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

export const WithError = {
  args: {
    label: "Status",
    data: options,
    error: "Select a status before continuing."
  }
};
