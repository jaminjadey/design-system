import type { Preview } from "@storybook/react-vite";
import { DemoThemeProvider } from "@demo-ds/mantine-theme";
import "@mantine/core/styles.css";
import "@demo-ds/tokens/tokens.css";
import "../src/storybook.css";

type StorybookColorScheme = "light" | "dark";

function getColorScheme(value: unknown): StorybookColorScheme {
  return value === "dark" ? "dark" : "light";
}

const preview: Preview = {
  globalTypes: {
    colorScheme: {
      name: "Color scheme",
      description: "Switch the design-system colour scheme",
      defaultValue: "light",
      toolbar: {
        icon: "contrast",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" }
        ],
        dynamicTitle: true
      }
    }
  },
  initialGlobals: {
    colorScheme: "light"
  },
  decorators: [
    (Story, context) => {
      const colorScheme = getColorScheme(context.globals.colorScheme);

      return (
        <DemoThemeProvider defaultColorScheme={colorScheme} forceColorScheme={colorScheme}>
          <div data-mantine-color-scheme={colorScheme}>
            <Story />
          </div>
        </DemoThemeProvider>
      );
    }
  ],
  parameters: {
    controls: { expanded: true },
    docs: {
      toc: true
    }
  }
};

export default preview;
