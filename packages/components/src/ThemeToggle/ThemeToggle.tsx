import { Switch, useComputedColorScheme, useMantineColorScheme } from "@mantine/core";
import type { CSSProperties, ReactNode } from "react";

export interface ThemeToggleProps {
  readonly label?: ReactNode;
  readonly lightLabel?: string;
  readonly darkLabel?: string;
  readonly disabled?: boolean;
  readonly id?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function ThemeToggle({
  lightLabel = "Light mode",
  darkLabel = "Dark mode",
  label,
  disabled = false,
  id,
  className,
  style
}: ThemeToggleProps) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light");
  const isDark = computedColorScheme === "dark";

  return (
    <Switch
      id={id}
      className={className}
      style={style}
      checked={isDark}
      disabled={disabled}
      label={label ?? (isDark ? darkLabel : lightLabel)}
      aria-label="Toggle colour scheme"
      onChange={(event) => setColorScheme(event.currentTarget.checked ? "dark" : "light")}
    />
  );
}
