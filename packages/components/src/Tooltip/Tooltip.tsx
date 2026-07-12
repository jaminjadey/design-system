import { Tooltip as MantineTooltip } from "@mantine/core";
import type { ReactElement, ReactNode } from "react";

export interface TooltipProps {
  readonly label: ReactNode;
  readonly children: ReactElement;
  readonly disabled?: boolean;
  readonly opened?: boolean;
  readonly position?: "top" | "right" | "bottom" | "left";
}

export function Tooltip({
  label,
  children,
  disabled = false,
  opened,
  position = "top"
}: TooltipProps) {
  return (
    <MantineTooltip
      label={label}
      disabled={disabled}
      opened={opened}
      position={position}
      withArrow
      styles={{
        tooltip: {
          background: componentVar("tooltip-background"),
          color: componentVar("tooltip-text"),
          paddingInline: componentVar("tooltip-padding-x"),
          paddingBlock: componentVar("tooltip-padding-y")
        },
        arrow: {
          background: componentVar("tooltip-background")
        }
      }}
    >
      {children}
    </MantineTooltip>
  );
}

function componentVar(path: string): string {
  return `var(--ds-component-${path})`;
}
