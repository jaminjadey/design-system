import { Button as MantineButton } from "@mantine/core";
import type { CSSProperties, MouseEventHandler, ReactNode } from "react";

export type ButtonTone = "primary" | "neutral" | "danger" | "success";
export type ButtonEmphasis = "high" | "medium" | "low";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  readonly children: ReactNode;
  readonly tone?: ButtonTone;
  readonly emphasis?: ButtonEmphasis;
  readonly size?: ButtonSize;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
  readonly leftSection?: ReactNode;
  readonly rightSection?: ReactNode;
  readonly id?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onClick?: MouseEventHandler<HTMLButtonElement>;
  readonly type?: "button" | "submit" | "reset";
  readonly "aria-label"?: string;
}

export function Button({
  tone = "primary",
  emphasis = "high",
  size = "md",
  type = "button",
  children,
  loading = false,
  disabled = false,
  fullWidth = false,
  leftSection,
  rightSection,
  id,
  className,
  style,
  onClick,
  "aria-label": ariaLabel
}: ButtonProps) {
  const background = disabled
    ? componentVar("button-disabled-background")
    : componentVar(`button-${tone}-${emphasis}-background`);
  const borderColor = disabled
    ? componentVar("button-disabled-border")
    : componentVar(`button-${tone}-${emphasis}-border`);
  const color = disabled
    ? componentVar("button-disabled-text")
    : componentVar(`button-${tone}-${emphasis}-text`);

  return (
    <MantineButton
      id={id}
      type={type}
      variant="default"
      radius="md"
      size={size}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      leftSection={leftSection}
      rightSection={rightSection}
      className={className}
      style={{
        background,
        borderColor,
        color,
        gap: componentVar("button-gap"),
        minHeight: componentVar(`button-height-${size}`),
        paddingInline: componentVar(`button-padding-x-${size}`),
        ...style
      }}
      onClick={onClick}
      aria-label={ariaLabel}
      data-tone={tone}
      data-emphasis={emphasis}
    >
      {children}
    </MantineButton>
  );
}

function componentVar(path: string): string {
  return `var(--ds-component-${path})`;
}
