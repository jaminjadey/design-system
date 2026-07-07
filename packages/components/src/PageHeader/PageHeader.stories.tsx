import { Button } from "../Button/Button.js";
import { PageHeader } from "./PageHeader.js";

export default {
  title: "Components/PageHeader",
  component: PageHeader,
  args: {
    title: "Project overview",
    description: "A generic page heading with optional supporting actions."
  }
};

export const Default = {};

export const WithActions = {
  render: () => (
    <PageHeader
      title="Project overview"
      description="Review current status and recent activity."
      actions={<Button>New item</Button>}
    />
  )
};
