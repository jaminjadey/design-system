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
      style={{
        background: componentVar(`status-badge-${tone}-${emphasis}-background`),
        borderColor: componentVar(`status-badge-${tone}-${emphasis}-border`),
        color: componentVar(`status-badge-${tone}-${emphasis}-text`),
        height: componentVar("status-badge-height"),
        paddingInline: componentVar("status-badge-padding-x"),
        ...style
      }}
      role="status"
      variant="outline"
      data-tone={tone}
      data-emphasis={emphasis}
    >
      {children}
    </Badge>
  );
}

function componentVar(path: string): string {
  return `var(--ds-component-${path})`;
}
