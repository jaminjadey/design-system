import { Paper } from "@mantine/core";
import type {
  CSSProperties,
  KeyboardEvent,
  KeyboardEventHandler,
  MouseEventHandler,
  ReactNode
} from "react";

export interface CardProps {
  readonly children?: ReactNode;
  readonly interactive?: boolean;
  readonly onClick?: MouseEventHandler<HTMLDivElement>;
  readonly onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  readonly id?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function Card({
  interactive = false,
  onClick,
  onKeyDown,
  id,
  className,
  style,
  children
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
      id={id}
      className={className}
      withBorder
      radius="md"
      p="md"
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      data-interactive={isInteractive || undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={{
        background: "var(--ds-color-background-card)",
        color: "var(--ds-color-text-default)",
        borderColor: "var(--ds-color-border-light)",
        boxShadow: "var(--ds-shadow-card)",
        cursor: isInteractive ? "pointer" : undefined,
        ...style
      }}
    >
      {children}
    </Paper>
  );
}
