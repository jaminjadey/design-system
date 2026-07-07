import { createTheme, type MantineColorsTuple } from "@mantine/core";

import { colorValue, dimensionValue, typographyValue } from "./tokenAccess.js";

export const defaultFontFamily = [
  "Inter",
  "ui-sans-serif",
  "system-ui",
  "-apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "sans-serif"
].join(", ");

const paletteShadeNames = ["5", "10", "20", "30", "40", "50", "60", "70", "80", "90"] as const;

function palette(name: "primary" | "neutral" | "danger" | "success" | "warning") {
  return paletteShadeNames.map((shade) =>
    colorValue(["color", "primitive", name, shade])
  ) as unknown as MantineColorsTuple;
}

function heading(level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") {
  const value = typographyValue(["typography", "heading", level]);
  return {
    fontSize: `${value.fontSize}px`,
    lineHeight: `${value.lineHeight}px`,
    fontWeight: String(value.fontWeight)
  };
}

export const demoTheme = createTheme({
  primaryColor: "primary",
  primaryShade: {
    light: 6,
    dark: 7
  },
  colors: {
    primary: palette("primary"),
    neutral: palette("neutral"),
    danger: palette("danger"),
    success: palette("success"),
    warning: palette("warning")
  },
  fontFamily: defaultFontFamily,
  headings: {
    fontFamily: defaultFontFamily,
    fontWeight: "600",
    sizes: {
      h1: heading("h1"),
      h2: heading("h2"),
      h3: heading("h3"),
      h4: heading("h4"),
      h5: heading("h5"),
      h6: heading("h6")
    }
  },
  spacing: {
    xs: dimensionValue(["space", "sm"]),
    sm: dimensionValue(["space", "md"]),
    md: dimensionValue(["space", "xl"]),
    lg: dimensionValue(["space", "2xl"]),
    xl: dimensionValue(["space", "3xl"])
  },
  radius: {
    xs: dimensionValue(["radius", "xs"]),
    sm: dimensionValue(["radius", "sm"]),
    md: dimensionValue(["radius", "md"]),
    lg: dimensionValue(["radius", "lg"]),
    xl: dimensionValue(["radius", "xl"])
  },
  defaultRadius: "md"
});
