import { Text } from "@mantine/core";

import { Card } from "./Card.js";

export default {
  title: "Components/Card",
  component: Card
};

export const Default = {
  render: () => (
    <Card>
      <Text fw={600}>Project summary</Text>
      <Text c="dimmed">A compact surface for related content.</Text>
    </Card>
  )
};

export const Interactive = {
  render: () => (
    <Card interactive onClick={() => undefined}>
      <Text fw={600}>Open details</Text>
      <Text c="dimmed">Keyboard and pointer users can activate this card.</Text>
    </Card>
  )
};
