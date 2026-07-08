import type { Preview } from "@storybook/react-vite";
import { DocsContainer, type DocsContainerProps } from "@storybook/addon-docs/blocks";
import { useEffect, type PropsWithChildren } from "react";
import { DemoThemeProvider } from "@demo-ds/mantine-theme";
import "@demo-ds/mantine-theme/styles.css";
import "../src/storybook.css";

type StorybookColorScheme = "light" | "dark";

function getColorScheme(value: unknown): StorybookColorScheme {
  return value === "dark" ? "dark" : "light";
}

function getUrlColorScheme(): StorybookColorScheme {
  if (typeof window === "undefined") {
    return "light";
  }

  const globals = new URLSearchParams(window.location.search).get("globals");

  return globals?.includes("colorScheme:dark") === true ? "dark" : "light";
}

function applyDocumentColorScheme(colorScheme: StorybookColorScheme) {
  document.documentElement.setAttribute("data-mantine-color-scheme", colorScheme);
  document.body.setAttribute("data-mantine-color-scheme", colorScheme);
}

function StorybookTheme({
  children,
  colorScheme
}: PropsWithChildren<{ readonly colorScheme: StorybookColorScheme }>) {
  if (typeof document !== "undefined") {
    applyDocumentColorScheme(colorScheme);
  }

  useEffect(() => {
    applyDocumentColorScheme(colorScheme);
  }, [colorScheme]);

  return (
    <DemoThemeProvider defaultColorScheme={colorScheme} forceColorScheme={colorScheme}>
      <div className="storybook-theme-root" data-mantine-color-scheme={colorScheme}>
        {children}
      </div>
    </DemoThemeProvider>
  );
}

function DocsThemeContainer({ children, context, theme }: DocsContainerProps) {
  const colorScheme = getUrlColorScheme();

  return (
    <StorybookTheme colorScheme={colorScheme}>
      <DocsContainer context={context} theme={theme}>
        {children}
      </DocsContainer>
    </StorybookTheme>
  );
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
        <StorybookTheme colorScheme={colorScheme}>
          <Story />
        </StorybookTheme>
      );
    }
  ],
  parameters: {
    a11y: {
      test: "todo"
    },
    controls: { expanded: true },
    docs: {
      container: DocsThemeContainer,
      toc: true
    }
  }
};

export default preview;
