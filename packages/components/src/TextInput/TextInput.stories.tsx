import { TextInput } from "./TextInput.js";

const defaultSource = `import { TextInput } from "@demo-ds/components";

export function Example() {
  return (
    <TextInput
      label="Project name"
      placeholder="Untitled project"
      helperText="Use a clear, generic name."
    />
  );
}`;

const errorSource = `import { TextInput } from "@demo-ds/components";

export function Example() {
  return (
    <TextInput
      label="Email"
      defaultValue="demo"
      error="Enter a valid email address"
    />
  );
}`;

const disabledSource = `import { TextInput } from "@demo-ds/components";

export function Example() {
  return <TextInput label="Account ID" value="demo-123" disabled />;
}`;

export default {
  title: "Components/TextInput",
  component: TextInput,
  tags: ["autodocs"],
  args: {
    label: "Project name",
    placeholder: "Untitled project",
    helperText: "Use a clear, generic name."
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
    label: "Email",
    defaultValue: "demo",
    error: "Enter a valid email address"
  },
  parameters: {
    docs: {
      source: {
        code: errorSource,
        language: "tsx"
      }
    }
  }
};

export const Disabled = {
  args: {
    label: "Account ID",
    value: "demo-123",
    disabled: true
  },
  parameters: {
    docs: {
      source: {
        code: disabledSource,
        language: "tsx"
      }
    }
  }
};
