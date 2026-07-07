import { Button } from "../Button/Button.js";
import { PageHeader } from "./PageHeader.js";

const defaultSource = `import { PageHeader } from "@demo-ds/components";

export function Example() {
  return (
    <PageHeader
      title="Project overview"
      description="A generic page heading with optional supporting actions."
    />
  );
}`;

const actionsSource = `import { Button, PageHeader } from "@demo-ds/components";

export function Example() {
  return (
    <PageHeader
      title="Project overview"
      description="Review current status and recent activity."
      actions={<Button>New item</Button>}
    />
  );
}`;

export default {
  title: "Components/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  args: {
    title: "Project overview",
    description: "A generic page heading with optional supporting actions."
  }
};

export const Default = {
  parameters: {
    docs: {
      source: {
        code: defaultSource,
        language: "tsx"
      }
    }
  }
};

export const WithActions = {
  parameters: {
    docs: {
      source: {
        code: actionsSource,
        language: "tsx"
      }
    }
  },
  render: () => (
    <PageHeader
      title="Project overview"
      description="Review current status and recent activity."
      actions={<Button>New item</Button>}
    />
  )
};
