import { componentPackageStatus } from "@demo-ds/components";
import { demoTheme } from "@demo-ds/mantine-theme";
import { metadata } from "@demo-ds/tokens";

export const storybookPackageStatus = {
  componentPackageStatus,
  themeSource: demoTheme.source,
  tokenSource: metadata.source
} as const;
