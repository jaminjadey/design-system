import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig, type UserConfig } from "vite";

const config: StorybookConfig = {
  stories: [
    "../../../packages/components/src/**/*.stories.@(ts|tsx|mdx)",
    "../src/**/*.mdx"
  ],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  docs: {
    defaultName: "Docs"
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      build: {
        // Storybook includes the docs runtime and axe in the preview bundle.
        chunkSizeWarningLimit: 2200,
        rolldownOptions: {
          checks: {
            pluginTimings: false
          }
        }
      }
    } satisfies UserConfig);
  }
};

export default config;
