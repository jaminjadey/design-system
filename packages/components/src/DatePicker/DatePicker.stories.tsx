import { DatePicker } from "./DatePicker.js";

const defaultSource = `import { DatePicker } from "@demo-ds/components";

export function Example() {
  return (
    <DatePicker
      label="Target date"
      defaultValue="2026-07-13"
      helperText="Use an ISO date value from your app state."
    />
  );
}`;

export default {
  title: "Components/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  args: {
    label: "Target date",
    defaultValue: "2026-07-13",
    helperText: "Use an ISO date value from your app state."
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

export const Disabled = {
  args: {
    label: "Locked date",
    value: "2026-07-13",
    disabled: true
  }
};
