import { ThemeToggle } from "./ThemeToggle.js";

const defaultSource = `import { ThemeToggle } from "@demo-ds/components";

export function Example() {
  return <ThemeToggle />;
}`;

const customLabelsSource = `import { ThemeToggle } from "@demo-ds/components";

export function Example() {
  return <ThemeToggle lightLabel="Use light theme" darkLabel="Use dark theme" />;
}`;

export default {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
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
  }
};

export const WithCustomLabels = {
  args: {
    lightLabel: "Use light theme",
    darkLabel: "Use dark theme"
  },
  parameters: {
    docs: {
      source: {
        code: customLabelsSource,
        language: "tsx"
      }
    }
  }
};
