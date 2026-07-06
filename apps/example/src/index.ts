import { componentPackageStatus } from "@demo-ds/components";
import { demoTheme } from "@demo-ds/mantine-theme";

export const examplePackageStatus = {
  componentPackageStatus,
  themeSource: demoTheme.source
} as const;
