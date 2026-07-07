import { Badge } from "@mantine/core";
import type { CSSProperties, ReactNode } from "react";

export type StatusBadgeTone = "neutral" | "success" | "warning" | "danger" | "info";
export type StatusBadgeEmphasis = "soft" | "solid" | "outline";

export interface StatusBadgeProps {
  readonly tone: StatusBadgeTone;
  readonly emphasis?: StatusBadgeEmphasis;
  readonly children: ReactNode;
  readonly id?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const toneColor: Record<StatusBadgeTone, string> = {
  neutral: "neutral",
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "primary"
};

const emphasisVariant: Record<StatusBadgeEmphasis, "light" | "filled" | "outline"> = {
  soft: "light",
  solid: "filled",
  outline: "outline"
};

export function StatusBadge({
  tone,
  emphasis = "soft",
  children,
  id,
  className,
  style
}: StatusBadgeProps) {
  return (
    <Badge
      id={id}
      className={className}
      style={style}
      role="status"
      color={toneColor[tone]}
      variant={emphasisVariant[emphasis]}
      data-tone={tone}
      data-emphasis={emphasis}
    >
      {children}
    </Badge>
  );
}
