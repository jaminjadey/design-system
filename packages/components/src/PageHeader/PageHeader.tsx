import { Group, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

export interface PageHeaderProps {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" gap="md" wrap="nowrap">
      <Stack gap="xs" style={{ minWidth: 0 }}>
        <Title
          order={1}
          style={{
            color: "var(--ds-color-text-default)",
            fontSize: "var(--ds-font-size-heading-h1)",
            lineHeight: "var(--ds-line-height-heading-h1)",
            fontWeight: "var(--ds-font-weight-heading-h1)"
          }}
        >
          {title}
        </Title>
        {description === undefined ? null : (
          <Text style={{ color: "var(--ds-color-text-light)" }}>{description}</Text>
        )}
      </Stack>
      {actions === undefined ? null : <Group gap="sm">{actions}</Group>}
    </Group>
  );
}
