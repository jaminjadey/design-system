import { Badge, type BadgeProps } from "@mantine/core";
import type { ReactNode } from "react";

export type StatusBadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface StatusBadgeProps extends Omit<BadgeProps, "children" | "color"> {
  readonly tone: StatusBadgeTone;
  readonly children: ReactNode;
}

const toneColor: Record<StatusBadgeTone, string> = {
  neutral: "neutral",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "primary"
};

export function StatusBadge({ tone, children, variant = "light", ...props }: StatusBadgeProps) {
  return (
    <Badge role="status" color={toneColor[tone]} variant={variant} data-tone={tone} {...props}>
      {children}
    </Badge>
  );
}
