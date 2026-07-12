import type { CSSProperties, ReactNode } from "react";

export type LoadingSpinnerSize = "sm" | "md" | "lg";

export interface LoadingSpinnerProps {
  readonly label?: ReactNode;
  readonly size?: LoadingSpinnerSize;
  readonly id?: string;
  readonly className?: string;
  readonly style?: CSSProperties;
}

export function LoadingSpinner({
  label = "Loading",
  size = "md",
  id,
  className,
  style
}: LoadingSpinnerProps) {
  return (
    <span
      id={id}
      className={className}
      role="status"
      aria-live="polite"
      style={{
        alignItems: "center",
        color: "var(--ds-color-text-default)",
        display: "inline-flex",
        gap: "var(--ds-space-xs)",
        ...style
      }}
    >
      <span
        aria-hidden="true"
        style={{
          animation: "demo-ds-spinner 800ms linear infinite",
          border: `2px solid ${componentVar("loading-spinner-background")}`,
          borderRadius: "999px",
          borderTopColor: componentVar("loading-spinner-foreground"),
          display: "inline-block",
          height: componentVar(`loading-spinner-size-${size}`),
          width: componentVar(`loading-spinner-size-${size}`)
        }}
      />
      <span>{label}</span>
    </span>
  );
}

function componentVar(path: string): string {
  return `var(--ds-component-${path})`;
}
