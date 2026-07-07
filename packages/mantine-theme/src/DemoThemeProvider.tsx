import { MantineProvider } from "@mantine/core";
import type { ReactNode } from "react";

import { demoCssVariablesResolver } from "./cssVariablesResolver.js";
import { demoTheme } from "./theme.js";

export type DemoColorScheme = "light" | "dark" | "auto";

export interface DemoThemeProviderProps {
  readonly children: ReactNode;
  readonly defaultColorScheme?: DemoColorScheme;
  readonly forceColorScheme?: "light" | "dark";
}

export function DemoThemeProvider({
  children,
  defaultColorScheme = "light",
  forceColorScheme
}: DemoThemeProviderProps) {
  return (
    <MantineProvider
      theme={demoTheme}
      defaultColorScheme={defaultColorScheme}
      forceColorScheme={forceColorScheme}
      cssVariablesResolver={demoCssVariablesResolver}
    >
      {children}
    </MantineProvider>
  );
}
