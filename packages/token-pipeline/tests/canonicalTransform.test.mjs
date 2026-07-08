import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCanonicalTokensFromRecords,
  buildCanonicalTokensFromRecordsWithReport,
  collectCanonicalTokens,
  defaultCanonicalMappingConfig,
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

test("maps source paths with configurable files, modes, and semantic prefixes", () => {
  const config = {
    ...defaultCanonicalMappingConfig,
    files: {
      ...defaultCanonicalMappingConfig.files,
      semanticColors: [
        {
          file: "brand-modes/Day.tokens.json",
          sourceMode: "Day",
          mode: "light"
        },
        {
          file: "brand-modes/Night.tokens.json",
          sourceMode: "Night",
          mode: "dark"
        }
      ]
    },
    semanticColors: {
      ...defaultCanonicalMappingConfig.semanticColors,
      categoryPrefixes: {
        ...defaultCanonicalMappingConfig.semanticColors.categoryPrefixes,
        "content-colours": ["text"]
      }
    }
  };

  const mapping = sourcePathToCanonicalPath(
    {
      file: "brand-modes/Night.tokens.json",
      sourcePath: ["Content colours", "Default text"],
      type: "color",
      value: "#f8fafc"
    },
    config
  );

  assert.deepEqual(mapping?.canonicalPath, ["color", "semantic", "text", "default"]);
  assert.equal(mapping?.mode, "dark");
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

test("build report explains mapped, renamed, and skipped source records", () => {
  const { document, report } = buildCanonicalTokensFromRecordsWithReport([
    colorRecord("tokens/Light.tokens.json", ["Font colours", "Default text"], "#083344"),
    colorRecord("tokens/Dark.tokens.json", ["Font colours", "Default text"], "#fdfdfd"),
    { file: "other.tokens.json", sourcePath: ["Unsupported"], type: "shadow", value: "none" }
  ]);
  const token = collectCanonicalTokens(document).find(
    (candidate) => candidate.name === "color.semantic.text.default"
  );

  assert.ok(token);
  assert.equal(report.sourceRecordsRead, 3);
  assert.equal(report.recordsMapped, 2);
  assert.equal(report.recordsSkipped, 1);
  assert.equal(report.tokensGenerated, 1);
  assert.deepEqual(report.unsupportedRecords[0], {
    file: "other.tokens.json",
    path: "Unsupported",
    message: "No canonical mapping for shadow source record"
  });
  assert.ok(
    report.renamedPaths.some(
      (entry) =>
        entry.sourcePath === "Font colours.Default text" &&
        entry.canonicalPath === "color.semantic.text.default"
    )
  );
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
