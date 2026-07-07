import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    "../../../packages/components/src/**/*.stories.@(ts|tsx|mdx)",
    "../src/**/*.mdx"
  ],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {
    defaultName: "Docs"
  }
};

export default config;
