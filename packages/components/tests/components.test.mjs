import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import test from "node:test";

import { DemoThemeProvider } from "@demo-ds/mantine-theme";
import {
  AlertBanner,
  Button,
  Card,
  PageHeader,
  StatusBadge,
  TextInput,
  ThemeToggle
} from "../dist/index.js";

function renderWithTheme(element) {
  return renderToStaticMarkup(
    React.createElement(DemoThemeProvider, null, element)
  );
}

test("Button renders children and maps tone/emphasis attributes", () => {
  const markup = renderWithTheme(
    React.createElement(Button, { tone: "danger", emphasis: "medium" }, "Delete")
  );

  assert.match(markup, /Delete/u);
  assert.match(markup, /data-tone="danger"/u);
  assert.match(markup, /data-emphasis="medium"/u);
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

test("AlertBanner uses alert role for danger tone", () => {
  const markup = renderWithTheme(
    React.createElement(
      AlertBanner,
      { tone: "danger", title: "Problem" },
      "The action failed."
    )
  );

  assert.match(markup, /role="alert"/u);
  assert.match(markup, /Problem/u);
  assert.match(markup, /The action failed/u);
});

test("Card marks interactive cards as keyboard focusable buttons", () => {
  const markup = renderWithTheme(
    React.createElement(Card, { interactive: true }, "Open project")
  );

  assert.match(markup, /role="button"/u);
  assert.match(markup, /tabindex="0"/u);
  assert.match(markup, /Open project/u);
});

test("StatusBadge exposes status role and tone attribute", () => {
  const markup = renderWithTheme(
    React.createElement(StatusBadge, { tone: "success" }, "Live")
  );

  assert.match(markup, /role="status"/u);
  assert.match(markup, /data-tone="success"/u);
  assert.match(markup, /Live/u);
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
    "../src/StatusBadge/StatusBadge.tsx"
  ]) {
    const source = await readFile(new URL(sourceFile, import.meta.url), "utf8");
    assert.equal(/:\s*"gray"|:\s*"red"|:\s*"green"|:\s*"yellow"/u.test(source), false);
  }
});
