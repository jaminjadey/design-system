import { Select as MantineSelect } from "@mantine/core";
import type { CSSProperties, ReactNode } from "react";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface SelectProps {
  readonly data: readonly SelectOption[];
  readonly label?: ReactNode;
  readonly placeholder?: string;
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly helperText?: ReactNode;
  readonly description?: ReactNode;
  readonly error?: ReactNode;
  readonly disabled?: boolean;
  readonly required?: boolean;
  readonly searchable?: boolean;
  readonly clearable?: boolean;
  readonly name?: string;
  readonly id?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onChange?: (value: string | null) => void;
}

export function Select({
  data,
  helperText,
  description,
  disabled = false,
  error,
  ...props
}: SelectProps) {
  const hasError = error !== undefined && error !== null && error !== false;

  return (
    <MantineSelect
      radius="md"
      data={data.map((option) => ({ value: option.value, label: option.label }))}
      disabled={disabled}
      description={description ?? helperText}
      error={error}
      styles={{
        input: {
          background: disabled
            ? "var(--ds-component-text-input-background-disabled)"
            : "var(--ds-component-select-input-background)",
          borderColor: hasError
            ? "var(--ds-component-text-input-border-error)"
            : "var(--ds-component-select-input-border)",
          color: disabled
            ? "var(--ds-component-text-input-text-disabled)"
            : "var(--ds-component-select-input-text)",
          minHeight: "var(--ds-component-select-height)",
          paddingInline: "var(--ds-component-select-padding-x)"
        },
        dropdown: {
          background: "var(--ds-component-select-dropdown-background)",
          borderColor: "var(--ds-component-select-dropdown-border)"
        },
        option: {
          "--_option-active-bg": "var(--ds-component-select-option-active-background)",
          "--_option-active-color": "var(--ds-component-select-option-active-text)"
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
