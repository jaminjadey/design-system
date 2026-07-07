import {
  TextInput as MantineTextInput,
  type TextInputProps as MantineTextInputProps
} from "@mantine/core";
import type { ReactNode } from "react";

export interface TextInputProps extends MantineTextInputProps {
  readonly helperText?: ReactNode;
}

export function TextInput({ helperText, description, radius = "md", ...props }: TextInputProps) {
  return (
    <MantineTextInput
      radius={radius}
      description={description ?? helperText}
      styles={{
        input: {
          background: "var(--ds-color-background-card)",
          color: "var(--ds-color-text-default)",
          borderColor: "var(--ds-color-border-light)"
        },
        label: {
          color: "var(--ds-color-text-default)"
        },
        description: {
          color: "var(--ds-color-text-light)"
        }
      }}
      {...props}
    />
  );
}
