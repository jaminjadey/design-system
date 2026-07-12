import { SegmentedControl as MantineSegmentedControl } from "@mantine/core";
import { useId, type CSSProperties, type ReactNode } from "react";

export interface SegmentedControlItem {
  readonly value: string;
  readonly label: ReactNode;
}

export interface SegmentedControlProps {
  readonly data: readonly SegmentedControlItem[];
  readonly label?: ReactNode;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly disabled?: boolean;
  readonly fullWidth?: boolean;
  readonly id?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
  readonly onChange?: (value: string) => void;
}

export function SegmentedControl({
  data,
  label,
  id,
  className,
  style,
  ...props
}: SegmentedControlProps) {
  const generatedId = useId();
  const labelId = label === undefined ? undefined : `${id ?? generatedId}-label`;

  return (
    <div className={className} style={style}>
      {label === undefined ? null : (
        <div
          id={labelId}
          style={{
            color: "var(--ds-component-text-input-text-default)",
            fontSize: "var(--ds-font-size-body-sm)",
            fontWeight: 600,
            marginBottom: "var(--ds-space-xs)"
          }}
        >
          {label}
        </div>
      )}
      <MantineSegmentedControl
        id={id}
        aria-labelledby={labelId}
        data={data.map((item) => ({ value: item.value, label: item.label }))}
        radius="md"
        styles={{
          root: {
            background: componentVar("segmented-control-background"),
            border: `1px solid ${componentVar("segmented-control-border")}`,
            minHeight: componentVar("segmented-control-height"),
            padding: 2
          },
          control: {
            minHeight: `calc(${componentVar("segmented-control-height")} - 4px)`
          },
          indicator: {
            background: componentVar("segmented-control-active-background")
          },
          label: {
            color: componentVar("segmented-control-text"),
            paddingInline: componentVar("segmented-control-padding-x")
          }
        }}
        {...props}
      />
    </div>
  );
}

function componentVar(path: string): string {
  return `var(--ds-component-${path})`;
}
