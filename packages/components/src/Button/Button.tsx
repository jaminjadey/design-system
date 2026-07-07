import {
  Button as MantineButton,
  type ButtonProps as MantineButtonProps
} from "@mantine/core";

export type ButtonTone = "primary" | "neutral" | "danger" | "success";
export type ButtonEmphasis = "high" | "medium" | "low";

export interface ButtonProps extends Omit<MantineButtonProps, "color" | "variant"> {
  readonly tone?: ButtonTone;
  readonly emphasis?: ButtonEmphasis;
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
  children,
  ...props
}: ButtonProps) {
  return (
    <MantineButton
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
