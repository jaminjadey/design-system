import { Button } from "@demo-ds/components";
import { demoThemeSummary } from "@demo-ds/mantine-theme";
import { metadata } from "@demo-ds/tokens";

export const storybookPackageStatus = {
  componentExport: Button.name,
  themePrimaryColor: demoThemeSummary.primaryColor,
  tokenSource: metadata.source
} as const;
