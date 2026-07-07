import { Switch, useComputedColorScheme, useMantineColorScheme, type SwitchProps } from "@mantine/core";

export interface ThemeToggleProps extends Omit<SwitchProps, "checked" | "onChange"> {
  readonly lightLabel?: string;
  readonly darkLabel?: string;
}

export function ThemeToggle({
  lightLabel = "Light mode",
  darkLabel = "Dark mode",
  label,
  ...props
}: ThemeToggleProps) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const isDark = computedColorScheme === "dark";

  return (
    <Switch
      checked={isDark}
      label={label ?? (isDark ? darkLabel : lightLabel)}
      aria-label="Toggle colour scheme"
      onChange={(event) => setColorScheme(event.currentTarget.checked ? "dark" : "light")}
      {...props}
    />
  );
}
