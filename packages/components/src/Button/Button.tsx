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

const toneColor: Record<ButtonTone, string> = {
  primary: "primary",
  neutral: "neutral",
  danger: "danger",
  success: "success"
};

const emphasisVariant: Record<ButtonEmphasis, "filled" | "light" | "subtle"> = {
  high: "filled",
  medium: "light",
  low: "subtle"
};

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
  return (
    <MantineButton
      id={id}
      type={type}
      color={toneColor[tone]}
      variant={emphasisVariant[emphasis]}
      radius="md"
      size={size}
      loading={loading}
      disabled={disabled}
      fullWidth={fullWidth}
      leftSection={leftSection}
      rightSection={rightSection}
      className={className}
      style={style}
      onClick={onClick}
      aria-label={ariaLabel}
      data-tone={tone}
      data-emphasis={emphasis}
    >
      {children}
    </MantineButton>
  );
}
