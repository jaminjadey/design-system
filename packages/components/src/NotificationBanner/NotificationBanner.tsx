import { Alert } from "@mantine/core";
import type { ReactNode } from "react";

export type NotificationBannerTone = "default" | "info" | "success" | "warning" | "danger";

export interface NotificationBannerProps {
  readonly tone?: NotificationBannerTone;
  readonly title?: ReactNode;
  readonly children: ReactNode;
}

const toneIcon: Record<NotificationBannerTone, string> = {
  default: "i",
  info: "i",
  success: "ok",
  warning: "!",
  danger: "!"
};

export function NotificationBanner({ tone = "default", title, children }: NotificationBannerProps) {
  return (
    <Alert
      role={tone === "danger" ? "alert" : "status"}
      title={title}
      icon={<span aria-hidden="true">{toneIcon[tone]}</span>}
      data-tone={tone}
      styles={{
        root: {
          background: componentVar(`notification-${tone}-background`),
          borderColor: componentVar(`notification-${tone}-border`),
          color: componentVar(`notification-${tone}-text`),
          paddingInline: componentVar("notification-padding-x"),
          paddingBlock: componentVar("notification-padding-y")
        },
        title: {
          color: componentVar(`notification-${tone}-text`)
        },
        message: {
          color: componentVar(`notification-${tone}-text`)
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
