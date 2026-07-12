import { TextInput as MantineTextInput } from "@mantine/core";
import type { ChangeEventHandler, CSSProperties, ReactNode } from "react";

export interface DatePickerProps {
  readonly label?: ReactNode;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly helperText?: ReactNode;
  readonly description?: ReactNode;
  readonly error?: ReactNode;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly min?: string;
  readonly max?: string;
  readonly name?: string;
  readonly id?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onChange?: ChangeEventHandler<HTMLInputElement>;
}

export function DatePicker({
  helperText,
  description,
  disabled = false,
  error,
  ...props
}: DatePickerProps) {
  const hasError = error !== undefined && error !== null && error !== false;

  return (
    <MantineTextInput
      type="date"
      radius="md"
      disabled={disabled}
      description={description ?? helperText}
      error={error}
      styles={{
        input: {
          accentColor: "var(--ds-component-date-picker-selected-background)",
          background: disabled
            ? "var(--ds-component-date-picker-disabled-background)"
            : "var(--ds-component-select-input-background)",
          borderColor: hasError
            ? "var(--ds-component-text-input-border-error)"
            : "var(--ds-component-select-input-border)",
          color: disabled
            ? "var(--ds-component-date-picker-disabled-text)"
            : "var(--ds-component-select-input-text)",
          minHeight: "var(--ds-component-date-picker-height)",
          paddingInline: "var(--ds-component-select-padding-x)"
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
