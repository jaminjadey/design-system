import {
  Button as MantineButton,
  type ButtonProps as MantineButtonProps
} from "@mantine/core";
import type { MouseEventHandler } from "react";

export type ButtonTone = "primary" | "neutral" | "danger" | "success";
export type ButtonEmphasis = "high" | "medium" | "low";

export interface ButtonProps extends Omit<MantineButtonProps, "color" | "variant"> {
  readonly tone?: ButtonTone;
  readonly emphasis?: ButtonEmphasis;
  readonly onClick?: MouseEventHandler<HTMLButtonElement>;
  readonly type?: "button" | "submit" | "reset";
}

const toneColor: Record<ButtonTone, string> = {
  primary: "primary",
  neutral: "neutral",
  danger: "danger",
  success: "success"
};

const emphasisVariant: Record<ButtonEmphasis, MantineButtonProps["variant"]> = {
  high: "filled",
  medium: "light",
  low: "subtle"
};

export function Button({
  tone = "primary",
  emphasis = "high",
  radius = "md",
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <MantineButton
      type={type}
      color={toneColor[tone]}
      variant={emphasisVariant[emphasis]}
      radius={radius}
      data-tone={tone}
      data-emphasis={emphasis}
      {...props}
    >
      {children}
    </MantineButton>
  );
}
