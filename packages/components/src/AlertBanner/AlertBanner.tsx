import { Alert } from "@mantine/core";
import type { ReactNode } from "react";

export type AlertBannerTone = "info" | "success" | "warning" | "danger";

export interface AlertBannerProps {
  readonly tone?: AlertBannerTone;
  readonly title?: ReactNode;
  readonly children: ReactNode;
}

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
      title={title}
      icon={<span aria-hidden="true">{toneIcon[tone]}</span>}
      data-tone={tone}
      styles={{
        root: {
          background: componentVar(`alert-banner-${tone}-background`),
          borderColor: componentVar(`alert-banner-${tone}-border`),
          color: componentVar(`alert-banner-${tone}-text`),
          paddingInline: componentVar("alert-banner-padding-x"),
          paddingBlock: componentVar("alert-banner-padding-y")
        },
        title: {
          color: componentVar(`alert-banner-${tone}-text`)
        },
        message: {
          color: componentVar(`alert-banner-${tone}-text`)
        }
      }}
    >
      {children}
    </Alert>
  );
}

function componentVar(path: string): string {
  return `var(--ds-component-${path})`;
}
