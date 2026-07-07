import { Card } from "./Card.js";

export default {
  title: "Components/Card",
  component: Card
};

export const Default = {
  render: () => (
    <Card>
      <strong>Project summary</strong>
      <p>A compact surface for related content.</p>
    </Card>
  )
};

export const Interactive = {
  render: () => (
    <Card interactive onClick={() => undefined}>
      <strong>Open details</strong>
      <p>Keyboard and pointer users can activate this card.</p>
    </Card>
  )
};
