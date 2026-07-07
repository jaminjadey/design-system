import { useState } from "react";
import { Button, PageHeader, StatusBadge, ThemeToggle } from "@demo-ds/components";

import { DemoShell } from "./components/DemoShell.js";
import { FormsPage } from "./pages/FormsPage.js";
import { OverviewPage } from "./pages/OverviewPage.js";
import { SettingsPage } from "./pages/SettingsPage.js";
import { TokensPage } from "./pages/TokensPage.js";

export type AppPageId = "overview" | "forms" | "settings" | "tokens";

export const appPages: ReadonlyArray<{ id: AppPageId; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "forms", label: "Forms" },
  { id: "settings", label: "Settings" },
  { id: "tokens", label: "Tokens" }
];

function renderPage(pageId: AppPageId) {
  switch (pageId) {
    case "forms":
      return <FormsPage />;
    case "settings":
      return <SettingsPage />;
    case "tokens":
      return <TokensPage />;
    case "overview":
    default:
      return <OverviewPage />;
  }
}

export function App() {
  const [activePage, setActivePage] = useState<AppPageId>("overview");

  return (
    <DemoShell
      pages={appPages}
      activePage={activePage}
      onPageChange={setActivePage}
      utility={
        <div className="app-toolbar">
          <StatusBadge tone="success">Packages linked</StatusBadge>
          <ThemeToggle lightLabel="Light" darkLabel="Dark" />
        </div>
      }
    >
      <PageHeader
        title="Design-system example"
        description="A generic app consuming the generated token, theme, and component packages."
        actions={
          <>
            <Button emphasis="low" tone="neutral">
              View tokens
            </Button>
            <Button>New item</Button>
          </>
        }
      />
      {renderPage(activePage)}
    </DemoShell>
  );
}
