import { ThemeToggle } from "./ThemeToggle.js";

export default {
  title: "Components/ThemeToggle",
  component: ThemeToggle
};

export const Default = {};

export const WithCustomLabels = {
  args: {
    lightLabel: "Use light theme",
    darkLabel: "Use dark theme"
  }
};
