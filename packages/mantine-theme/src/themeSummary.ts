import { demoTheme, defaultFontFamily } from "./theme.js";

export interface DemoThemeSummary {
  readonly primaryColor: string;
  readonly primaryShadeCount: number;
  readonly defaultRadius: string;
  readonly headingFontFamily: string;
}

export const demoThemeSummary: DemoThemeSummary = {
  primaryColor: demoTheme.primaryColor ?? "primary",
  primaryShadeCount: demoTheme.colors?.primary?.length ?? 0,
  defaultRadius: String(demoTheme.defaultRadius ?? "md"),
  headingFontFamily: demoTheme.headings?.fontFamily ?? defaultFontFamily
};
