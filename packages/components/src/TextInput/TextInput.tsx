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

export function TextInput({
  helperText,
  description,
  disabled = false,
  error,
  ...props
}: TextInputProps) {
  const hasError = error !== undefined && error !== null && error !== false;

  return (
    <MantineTextInput
      radius="md"
      disabled={disabled}
      description={description ?? helperText}
      error={error}
      styles={{
        input: {
          background: disabled
            ? "var(--ds-component-text-input-background-disabled)"
            : "var(--ds-component-text-input-background-default)",
          borderColor: hasError
            ? "var(--ds-component-text-input-border-error)"
            : disabled
              ? "var(--ds-component-text-input-border-disabled)"
              : "var(--ds-component-text-input-border-default)",
          color: disabled
            ? "var(--ds-component-text-input-text-disabled)"
            : "var(--ds-component-text-input-text-default)",
          minHeight: "var(--ds-component-text-input-height)",
          paddingInline: "var(--ds-component-text-input-padding-x)"
        },
        label: {
          color: "var(--ds-component-text-input-text-default)"
        },
        description: {
          color: "var(--ds-component-text-input-text-helper)"
        },
        error: {
          color: "var(--ds-component-text-input-text-error)"
        }
      }}
      {...props}
    />
  );
}
