import { Button } from "@demo-ds/components";
import { demoTheme } from "@demo-ds/mantine-theme";
import { metadata } from "@demo-ds/tokens";

export const storybookPackageStatus = {
  componentExport: Button.name,
  themePrimaryColor: demoTheme.primaryColor,
  tokenSource: metadata.source
} as const;
