import { Paper, type PaperProps } from "@mantine/core";
import type { KeyboardEvent, KeyboardEventHandler, MouseEventHandler, ReactNode } from "react";

export interface CardProps extends PaperProps {
  readonly children?: ReactNode;
  readonly interactive?: boolean;
  readonly onClick?: MouseEventHandler<HTMLDivElement>;
  readonly onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
}

export function Card({
  interactive = false,
  withBorder = true,
  radius = "md",
  p = "md",
  onClick,
  onKeyDown,
  style,
  ...props
}: CardProps) {
  const isInteractive = interactive || onClick !== undefined;

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (!event.defaultPrevented && isInteractive && onClick !== undefined) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.currentTarget.click();
      }
    }
  }

  return (
    <Paper
      withBorder={withBorder}
      radius={radius}
      p={p}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      data-interactive={isInteractive || undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{
        background: "var(--ds-color-background-card)",
        color: "var(--ds-color-text-default)",
        borderColor: "var(--ds-color-border-light)",
        cursor: isInteractive ? "pointer" : undefined,
        ...style
      }}
      {...props}
    />
  );
}
