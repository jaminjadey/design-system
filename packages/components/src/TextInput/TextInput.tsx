import { TextInput as MantineTextInput } from "@mantine/core";
import type { CSSProperties, ChangeEventHandler, ReactNode } from "react";

export interface TextInputProps {
  readonly label?: ReactNode;
  readonly placeholder?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly helperText?: ReactNode;
  readonly description?: ReactNode;
  readonly error?: ReactNode;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly readOnly?: boolean;
  readonly name?: string;
  readonly id?: string;
  readonly type?: "text" | "email" | "password" | "search" | "tel" | "url";
  readonly autoComplete?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onChange?: ChangeEventHandler<HTMLInputElement>;
}

export function TextInput({ helperText, description, ...props }: TextInputProps) {
  return (
    <MantineTextInput
      radius="md"
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
