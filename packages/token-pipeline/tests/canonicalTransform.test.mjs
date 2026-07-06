import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCanonicalTokensFromRecords,
  collectCanonicalTokens,
  flattenSourceTokens,
  normaliseColorValue,
  normaliseNameSegment,
  sourcePathToCanonicalPath
} from "../dist/index.js";

test("flattens nested source token objects into source records", () => {
  const records = flattenSourceTokens(
    {
      "Font colours": {
        "Default text": {
          $type: "color",
          $value: "#083344"
        }
      }
    },
    "tokens/Light.tokens.json"
  );

  assert.deepEqual(records, [
    {
      file: "tokens/Light.tokens.json",
      sourcePath: ["Font colours", "Default text"],
      type: "color",
      value: "#083344"
    }
  ]);
});

test("normalises source names to kebab-case segments", () => {
  assert.equal(normaliseNameSegment(" Default text "), "default-text");
  assert.equal(normaliseNameSegment("Accent A / B & C"), "accent-a-b-and-c");
});

test("maps source paths to canonical paths", () => {
  const mapping = sourcePathToCanonicalPath({
    file: "tokens/Light.tokens.json",
    sourcePath: ["Font colours", "Default text"],
    type: "color",
    value: "#083344"
  });

  assert.deepEqual(mapping?.canonicalPath, ["color", "semantic", "text", "default"]);
  assert.equal(mapping?.mode, "light");
});

test("normalises colour values to uppercase hex", () => {
  assert.equal(normaliseColorValue("#ecfeff"), "#ECFEFF");
  assert.equal(
    normaliseColorValue({
      colorSpace: "srgb",
      components: [0.9254901961, 0.9960784314, 1],
      alpha: 1,
      hex: "#ecfeff"
    }),
    "#ECFEFF"
  );
});

test("merges semantic colour light and dark values", () => {
  const document = buildCanonicalTokensFromRecords([
    colorRecord("tokens/Light.tokens.json", ["Font colours", "Default text"], "#083344"),
    colorRecord("tokens/Dark.tokens.json", ["Font colours", "Default text"], "#fdfdfd")
  ]);
  const token = collectCanonicalTokens(document).find(
    (candidate) => candidate.name === "color.semantic.text.default"
  );

  assert.deepEqual(token?.value, {
    light: "#083344",
    dark: "#FDFDFD"
  });
});

test("maps radius source typo and corner size names", () => {
  const document = buildCanonicalTokensFromRecords([
    numberRecord("corners/Mode 1.tokens.json", ["Corder-radius", "Corner-Med"], 8)
  ]);
  const token = collectCanonicalTokens(document).find((candidate) => candidate.name === "radius.md");

  assert.equal(token?.type, "radius");
  assert.equal(token?.value, 8);
  assert.equal(token?.unit, "px");
});

test("groups typography FontSize, LineHeight, and FontWeight records", () => {
  const document = buildCanonicalTokensFromRecords([
    numberRecord("typography/Default.tokens.json", ["H1", "FontSize"], 32),
    numberRecord("typography/Default.tokens.json", ["H1", "LineHeight"], 40),
    numberRecord("typography/Default.tokens.json", ["H1", "FontWeight"], 700)
  ]);
  const token = collectCanonicalTokens(document).find(
    (candidate) => candidate.name === "typography.heading.h1"
  );

  assert.deepEqual(token?.value, {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 700
  });
});

function colorRecord(file, sourcePath, value) {
  return {
    file,
    sourcePath,
    type: "color",
    value
  };
}

function numberRecord(file, sourcePath, value) {
  return {
    file,
    sourcePath,
    type: "number",
    value
  };
}
