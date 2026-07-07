import { Alert } from "@mantine/core";
import type { ReactNode } from "react";

export type AlertBannerTone = "info" | "success" | "warning" | "danger";

export interface AlertBannerProps {
  readonly tone?: AlertBannerTone;
  readonly title?: ReactNode;
  readonly children: ReactNode;
}

const toneColor: Record<AlertBannerTone, string> = {
  info: "primary",
  success: "success",
  warning: "warning",
  danger: "danger"
};

const toneIcon: Record<AlertBannerTone, string> = {
  info: "i",
  success: "ok",
  warning: "!",
  danger: "!"
};

export function AlertBanner({ tone = "info", title, children }: AlertBannerProps) {
  return (
    <Alert
      role={tone === "danger" ? "alert" : "status"}
      color={toneColor[tone]}
      title={title}
      icon={<span aria-hidden="true">{toneIcon[tone]}</span>}
      data-tone={tone}
      styles={{
        root: {
          background: "var(--ds-color-background-card)",
          color: "var(--ds-color-text-default)",
          borderColor: "var(--ds-color-border-light)"
        },
        title: {
          color: "var(--ds-color-text-default)"
        },
        message: {
          color: "var(--ds-color-text-light)"
        }
      }}
    >
      {children}
    </Alert>
  );
}
