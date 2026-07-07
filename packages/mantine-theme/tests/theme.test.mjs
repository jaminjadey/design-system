import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";
import test from "node:test";

import { tokens } from "@demo-ds/tokens";
import {
  DemoThemeProvider,
  defaultFontFamily,
  demoCssVariablesResolver,
  demoTheme
} from "../dist/index.js";

test("theme maps primary primitive palette to Mantine colors", () => {
  assert.equal(demoTheme.primaryColor, "primary");
  assert.equal(demoTheme.colors.primary.length, 10);
  assert.deepEqual(demoTheme.colors.primary, [
    tokens.color.primitive.primary["5"].value,
    tokens.color.primitive.primary["10"].value,
    tokens.color.primitive.primary["20"].value,
    tokens.color.primitive.primary["30"].value,
    tokens.color.primitive.primary["40"].value,
    tokens.color.primitive.primary["50"].value,
    tokens.color.primitive.primary["60"].value,
    tokens.color.primitive.primary["70"].value,
    tokens.color.primitive.primary["80"].value,
    tokens.color.primitive.primary["90"].value
  ]);
});

test("theme maps supported tone palettes from primitive tokens", () => {
  for (const tone of ["neutral", "danger", "success", "warning"]) {
    assert.equal(demoTheme.colors[tone].length, 10);
    assert.deepEqual(demoTheme.colors[tone], [
      tokens.color.primitive[tone]["5"].value,
      tokens.color.primitive[tone]["10"].value,
      tokens.color.primitive[tone]["20"].value,
      tokens.color.primitive[tone]["30"].value,
      tokens.color.primitive[tone]["40"].value,
      tokens.color.primitive[tone]["50"].value,
      tokens.color.primitive[tone]["60"].value,
      tokens.color.primitive[tone]["70"].value,
      tokens.color.primitive[tone]["80"].value,
      tokens.color.primitive[tone]["90"].value
    ]);
  }
});

test("theme maps selected spacing and radius tokens", () => {
  assert.equal(demoTheme.spacing.xs, `${tokens.space.sm.value}px`);
  assert.equal(demoTheme.spacing.md, `${tokens.space.xl.value}px`);
  assert.equal(demoTheme.spacing.xl, `${tokens.space["3xl"].value}px`);
  assert.equal(demoTheme.radius.xs, `${tokens.radius.xs.value}px`);
  assert.equal(demoTheme.radius.md, `${tokens.radius.md.value}px`);
  assert.equal(demoTheme.radius.xl, `${tokens.radius.xl.value}px`);
});

test("theme maps heading typography tokens", () => {
  assert.deepEqual(demoTheme.headings.sizes.h1, {
    fontSize: `${tokens.typography.heading.h1.value.fontSize}px`,
    lineHeight: `${tokens.typography.heading.h1.value.lineHeight}px`,
    fontWeight: String(tokens.typography.heading.h1.value.fontWeight)
  });
  assert.equal(demoTheme.headings.fontFamily, defaultFontFamily);
});

test("css variables resolver exposes selected semantic mode values", () => {
  const resolved = demoCssVariablesResolver(demoTheme);

  assert.equal(resolved.variables["--ds-font-family-body"], defaultFontFamily);
  assert.equal(
    resolved.light["--ds-color-text-default"],
    tokens.color.semantic.text.default.value.light
  );
  assert.equal(
    resolved.dark["--ds-color-background-body"],
    tokens.color.semantic.background.body.value.dark
  );
});

test("DemoThemeProvider renders children", () => {
  const markup = renderToString(
    React.createElement(
      DemoThemeProvider,
      { defaultColorScheme: "dark" },
      React.createElement("span", null, "Provider child")
    )
  );

  assert.match(markup, /Provider child/u);
});

test("theme uses only generic font names", () => {
  const serialized = JSON.stringify(demoTheme).toLowerCase();
  assert.match(defaultFontFamily, /system-ui/u);
  assert.equal(serialized.includes("private"), false);
  assert.equal(serialized.includes("company"), false);
  assert.equal(serialized.includes("proprietary"), false);
});
