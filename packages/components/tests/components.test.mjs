import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";

import { DemoThemeProvider } from "@demo-ds/mantine-theme";
import {
  AlertBanner,
  Button,
  Card,
  DatePicker,
  LoadingSpinner,
  NotificationBanner,
  PageHeader,
  SegmentedControl,
  Select,
  StatusBadge,
  TextInput,
  ThemeToggle,
  Tooltip
} from "../dist/index.js";

function renderWithTheme(element) {
  return renderToStaticMarkup(React.createElement(DemoThemeProvider, null, element));
}

test("Button renders children and maps tone/emphasis attributes", () => {
  const markup = renderWithTheme(
    React.createElement(Button, { tone: "danger", emphasis: "medium" }, "Delete")
  );

  assert.match(markup, /Delete/u);
  assert.match(markup, /data-tone="danger"/u);
  assert.match(markup, /data-emphasis="medium"/u);
  assert.match(markup, /--ds-component-button-danger-medium-background/u);
  assert.match(markup, /--ds-component-button-danger-medium-text/u);
});

test("Button passes through native button type", () => {
  const markup = renderWithTheme(React.createElement(Button, { type: "submit" }, "Save"));

  assert.match(markup, /type="submit"/u);
  assert.match(markup, /Save/u);
});

test("TextInput renders label and helper text", () => {
  const markup = renderWithTheme(
    React.createElement(TextInput, {
      label: "Project name",
      helperText: "Use a generic name",
      defaultValue: "Demo"
    })
  );

  assert.match(markup, /Project name/u);
  assert.match(markup, /Use a generic name/u);
  assert.match(markup, /Demo/u);
});

test("TextInput error state uses component error tokens", () => {
  const markup = renderWithTheme(
    React.createElement(TextInput, {
      label: "Email",
      defaultValue: "demo",
      error: "Enter a valid email address"
    })
  );

  assert.match(markup, /Enter a valid email address/u);
  assert.match(markup, /--ds-component-text-input-border-error/u);
  assert.match(markup, /--ds-component-text-input-text-error/u);
});

test("AlertBanner uses alert role for danger tone", () => {
  const markup = renderWithTheme(
    React.createElement(AlertBanner, { tone: "danger", title: "Problem" }, "The action failed.")
  );

  assert.match(markup, /role="alert"/u);
  assert.match(markup, /Problem/u);
  assert.match(markup, /--ds-component-alert-banner-danger-background/u);
  assert.match(markup, /The action failed/u);
});

test("Card marks interactive cards as keyboard focusable buttons", () => {
  const markup = renderWithTheme(React.createElement(Card, { interactive: true }, "Open project"));

  assert.match(markup, /role="button"/u);
  assert.match(markup, /tabindex="0"/u);
  assert.match(markup, /--ds-component-card-surface-background/u);
  assert.match(markup, /--ds-shadow-card/u);
  assert.match(markup, /Open project/u);
});

test("StatusBadge exposes status role and tone attribute", () => {
  const markup = renderWithTheme(React.createElement(StatusBadge, { tone: "success" }, "Live"));

  assert.match(markup, /role="status"/u);
  assert.match(markup, /data-tone="success"/u);
  assert.match(markup, /--ds-component-status-badge-success-soft-background/u);
  assert.match(markup, /Live/u);
});

test("NotificationBanner uses component notification tokens", () => {
  const markup = renderWithTheme(
    React.createElement(
      NotificationBanner,
      { tone: "warning", title: "Needs review" },
      "Check token mappings."
    )
  );

  assert.match(markup, /role="status"/u);
  assert.match(markup, /Needs review/u);
  assert.match(markup, /--ds-component-notification-warning-background/u);
  assert.match(markup, /Check token mappings/u);
});

test("Select renders a labelled input with select tokens", () => {
  const markup = renderWithTheme(
    React.createElement(Select, {
      label: "Status",
      data: [
        { value: "draft", label: "Draft" },
        { value: "live", label: "Live" }
      ],
      defaultValue: "draft"
    })
  );

  assert.match(markup, /Status/u);
  assert.match(markup, /--ds-component-select-input-background/u);
  assert.match(markup, /--ds-component-select-height/u);
});

test("SegmentedControl renders labelled choices with segmented tokens", () => {
  const markup = renderWithTheme(
    React.createElement(SegmentedControl, {
      label: "View",
      data: [
        { value: "overview", label: "Overview" },
        { value: "activity", label: "Activity" }
      ],
      defaultValue: "overview"
    })
  );

  assert.match(markup, /View/u);
  assert.match(markup, /Overview/u);
  assert.match(markup, /--ds-component-segmented-control-background/u);
  assert.match(markup, /--ds-component-segmented-control-height/u);
});

test("Tooltip renders its child and maps tooltip overlay tokens", async () => {
  const markup = renderWithTheme(
    React.createElement(
      Tooltip,
      { label: "Create a generic item", opened: true },
      React.createElement(Button, null, "New item")
    )
  );
  const source = await readFile(new URL("../src/Tooltip/Tooltip.tsx", import.meta.url), "utf8");

  assert.match(markup, /New item/u);
  assert.match(source, /componentVar\("tooltip-background"\)/u);
  assert.match(source, /componentVar\("tooltip-text"\)/u);
});

test("DatePicker renders a date input with date-picker tokens", () => {
  const markup = renderWithTheme(
    React.createElement(DatePicker, {
      label: "Target date",
      defaultValue: "2026-07-13"
    })
  );

  assert.match(markup, /Target date/u);
  assert.match(markup, /type="date"/u);
  assert.match(markup, /--ds-component-date-picker-selected-background/u);
  assert.match(markup, /--ds-component-date-picker-height/u);
});

test("LoadingSpinner exposes status text and spinner tokens", () => {
  const markup = renderWithTheme(
    React.createElement(LoadingSpinner, { label: "Loading report", size: "lg" })
  );

  assert.match(markup, /role="status"/u);
  assert.match(markup, /Loading report/u);
  assert.match(markup, /--ds-component-loading-spinner-foreground/u);
  assert.match(markup, /--ds-component-loading-spinner-size-lg/u);
});

test("PageHeader renders title, description, and actions", () => {
  const markup = renderWithTheme(
    React.createElement(PageHeader, {
      title: "Project overview",
      description: "Review current status",
      actions: React.createElement(Button, null, "New item")
    })
  );

  assert.match(markup, /Project overview/u);
  assert.match(markup, /Review current status/u);
  assert.match(markup, /New item/u);
});

test("ThemeToggle renders an accessible switch", () => {
  const markup = renderWithTheme(React.createElement(ThemeToggle));

  assert.match(markup, /type="checkbox"/u);
  assert.match(markup, /Toggle colour scheme/u);
});

test("tone mappings use design-system palette names instead of Mantine built-ins", async () => {
  for (const sourceFile of [
    "../src/Button/Button.tsx",
    "../src/AlertBanner/AlertBanner.tsx",
    "../src/NotificationBanner/NotificationBanner.tsx",
    "../src/StatusBadge/StatusBadge.tsx"
  ]) {
    const source = await readFile(new URL(sourceFile, import.meta.url), "utf8");
    assert.equal(/:\s*"gray"|:\s*"red"|:\s*"green"|:\s*"yellow"/u.test(source), false);
  }
});

test("public component declarations do not expose Mantine types", async () => {
  const declarationFiles = await collectDeclarationFiles(new URL("../dist/", import.meta.url));

  for (const file of declarationFiles) {
    const source = await readFile(file, "utf8");
    assert.equal(source.includes("@mantine/"), false, `${file.pathname} should not expose Mantine`);
  }
});

async function collectDeclarationFiles(directoryUrl) {
  const entries = await readdir(directoryUrl, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const childUrl = new URL(entry.name, directoryUrl);
    if (entry.isDirectory()) {
      files.push(...(await collectDeclarationFiles(new URL(`${entry.name}/`, directoryUrl))));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".d.ts")) {
      files.push(childUrl);
    }
  }

  return files;
}
