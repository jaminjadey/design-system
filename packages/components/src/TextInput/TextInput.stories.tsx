import { TextInput } from "./TextInput.js";

export default {
  title: "Components/TextInput",
  component: TextInput,
  args: {
    label: "Project name",
    placeholder: "Untitled project",
    helperText: "Use a clear, generic name."
  }
};

export const Default = {};

export const WithError = {
  args: {
    label: "Email",
    defaultValue: "demo",
    error: "Enter a valid email address"
  }
};

export const Disabled = {
  args: {
    label: "Account ID",
    value: "demo-123",
    disabled: true
  }
};
