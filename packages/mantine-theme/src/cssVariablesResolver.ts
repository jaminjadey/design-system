import type { CSSVariablesResolver } from "@mantine/core";

import { cssVariable, modeColorValue } from "./tokenAccess.js";
import { defaultFontFamily } from "./theme.js";

export const demoCssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    "--ds-font-family-body": defaultFontFamily
  },
  light: {
    [cssVariable(["color", "semantic", "text", "default"])]: modeColorValue(
      ["color", "semantic", "text", "default"],
      "light"
    ),
    [cssVariable(["color", "semantic", "background", "body"])]: modeColorValue(
      ["color", "semantic", "background", "body"],
      "light"
    ),
    [cssVariable(["color", "semantic", "background", "card"])]: modeColorValue(
      ["color", "semantic", "background", "card"],
      "light"
    )
  },
  dark: {
    [cssVariable(["color", "semantic", "text", "default"])]: modeColorValue(
      ["color", "semantic", "text", "default"],
      "dark"
    ),
    [cssVariable(["color", "semantic", "background", "body"])]: modeColorValue(
      ["color", "semantic", "background", "body"],
      "dark"
    ),
    [cssVariable(["color", "semantic", "background", "card"])]: modeColorValue(
      ["color", "semantic", "background", "card"],
      "dark"
    )
  }
});
