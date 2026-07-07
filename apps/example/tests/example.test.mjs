import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import test from "node:test";

import { DemoThemeProvider } from "@demo-ds/mantine-theme";
import { App, appPages } from "../dist/compiled/App.js";

test("example app renders main navigation and package components", () => {
  const markup = renderToString(
    React.createElement(
      DemoThemeProvider,
      { defaultColorScheme: "light" },
      React.createElement(App)
    )
  );

  for (const page of appPages) {
    assert.match(markup, new RegExp(page.label, "u"));
  }

  assert.match(markup, /Design-system example/u);
  assert.match(markup, /Package consumption check/u);
  assert.match(markup, /Toggle colour scheme/u);
  assert.match(markup, /data-tone="success"/u);
});
