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
  parseTokenPipelineConfig,
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
    "semantics/light.tokens.json"
  );

  assert.deepEqual(records, [
    {
      file: "semantics/light.tokens.json",
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
    file: "semantics/light.tokens.json",
    sourcePath: ["Font colours", "Default text"],
    type: "color",
    value: "#083344"
  });

  assert.deepEqual(mapping?.canonicalPath, ["color", "semantic", "text", "default"]);
  assert.equal(mapping?.mode, "light");
});

test("maps configured shadow parts to canonical shadow tokens", () => {
  const mapping = sourcePathToCanonicalPath({
    file: "semantics/light.tokens.json",
    sourcePath: ["Drop shadows - cards", "Position Y"],
    type: "number",
    value: 2
  });

  assert.equal(mapping?.category, "shadow-part");
  assert.deepEqual(mapping?.canonicalPath, ["shadow", "card"]);
  assert.equal(mapping?.shadowProperty, "y");
  assert.equal(mapping?.mode, "light");
});

test("maps component colour source paths to component token paths", () => {
  const mapping = sourcePathToCanonicalPath({
    file: "components/light.tokens.json",
    sourcePath: ["Button", "Primary", "High", "Background"],
    type: "color",
    value: "#155e75"
  });

  assert.equal(mapping?.category, "component-color");
  assert.deepEqual(mapping?.canonicalPath, [
    "component",
    "button",
    "primary",
    "high",
    "background"
  ]);
  assert.equal(mapping?.mode, "light");
});

test("maps component dimensions to px component tokens", () => {
  const document = buildCanonicalTokensFromRecords([
    numberRecord("components/dimensions.tokens.json", ["Button", "Padding x", "Md"], 16)
  ]);
  const token = collectCanonicalTokens(document).find(
    (candidate) => candidate.name === "component.button.padding.x.md"
  );

  assert.equal(token?.type, "component");
  assert.equal(token?.valueType, "dimension");
  assert.equal(token?.value, 16);
  assert.equal(token?.unit, "px");
  assert.equal(token?.cssVariable, "--ds-component-button-padding-x-md");
});

test("merges light and dark component colour values", () => {
  const document = buildCanonicalTokensFromRecords([
    colorRecord(
      "components/light.tokens.json",
      ["Button", "Primary", "High", "Background"],
      "#155e75"
    ),
    colorRecord(
      "components/dark.tokens.json",
      ["Button", "Primary", "High", "Background"],
      "#0e7490"
    )
  ]);
  const token = collectCanonicalTokens(document).find(
    (candidate) => candidate.name === "component.button.primary.high.background"
  );

  assert.equal(token?.type, "component");
  assert.equal(token?.valueType, "color");
  assert.deepEqual(token?.value, {
    light: "#155E75",
    dark: "#0E7490"
  });
  assert.equal(token?.cssVariable, "--ds-component-button-primary-high-background");
});

test("can map configured component categories from semantic mode files", () => {
  const config = {
    ...defaultCanonicalMappingConfig,
    files: {
      ...defaultCanonicalMappingConfig.files,
      componentColors: [
        {
          file: "semantics/light.tokens.json",
          sourceMode: "Light",
          mode: "light"
        },
        {
          file: "semantics/dark.tokens.json",
          sourceMode: "Dark",
          mode: "dark"
        }
      ]
    },
    components: {
      ...defaultCanonicalMappingConfig.components,
      categoryPrefixes: {
        ...defaultCanonicalMappingConfig.components.categoryPrefixes,
        "button-colours": ["button"]
      }
    }
  };
  const mapping = sourcePathToCanonicalPath(
    {
      file: "semantics/light.tokens.json",
      sourcePath: ["Button colours", "Button secondary border"],
      type: "color",
      value: "#155e75"
    },
    config
  );

  assert.equal(mapping?.category, "component-color");
  assert.deepEqual(mapping?.canonicalPath, ["component", "button", "secondary", "border"]);
});

test("can map mixed Figma component-like colour groups by configured leaf prefixes", () => {
  const config = {
    ...defaultCanonicalMappingConfig,
    files: {
      ...defaultCanonicalMappingConfig.files,
      componentColors: [
        {
          file: "semantics/light.tokens.json",
          sourceMode: "Light",
          mode: "light"
        },
        {
          file: "semantics/dark.tokens.json",
          sourceMode: "Dark",
          mode: "dark"
        }
      ]
    }
  };

  assert.deepEqual(
    sourcePathToCanonicalPath(
      colorRecord(
        "semantics/light.tokens.json",
        ["Form input backgrounds", "Segmented control active background"],
        "#ffffff"
      ),
      config
    )?.canonicalPath,
    ["component", "segmented-control", "active", "background"]
  );
  assert.deepEqual(
    sourcePathToCanonicalPath(
      colorRecord(
        "semantics/light.tokens.json",
        ["Notifications", "Alert notification text"],
        "#991b1b"
      ),
      config
    )?.canonicalPath,
    ["component", "notification", "danger", "text"]
  );
  assert.deepEqual(
    sourcePathToCanonicalPath(
      colorRecord(
        "semantics/light.tokens.json",
        ["Date picker backgrounds", "Selected date background"],
        "#0891b2"
      ),
      config
    )?.canonicalPath,
    ["component", "date-picker", "selected", "background"]
  );
  assert.deepEqual(
    sourcePathToCanonicalPath(
      colorRecord(
        "semantics/light.tokens.json",
        ["Loading states", "Spinner foreground"],
        "#0891b2"
      ),
      config
    )?.canonicalPath,
    ["component", "loading-spinner", "foreground"]
  );
});

test("defaults shadow config when older pipeline configs omit it", () => {
  const configWithoutShadows = JSON.parse(JSON.stringify(defaultCanonicalMappingConfig));
  delete configWithoutShadows.shadows;

  const parsed = parseTokenPipelineConfig({ canonical: configWithoutShadows });

  assert.deepEqual(parsed.canonical.shadows.categoryPaths["drop-shadows-cards"], ["card"]);
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
    colorRecord("semantics/light.tokens.json", ["Font colours", "Default text"], "#083344"),
    colorRecord("semantics/dark.tokens.json", ["Font colours", "Default text"], "#fdfdfd")
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
    numberRecord("radius.tokens.json", ["Corder-radius", "Corner-Med"], 8)
  ]);
  const token = collectCanonicalTokens(document).find(
    (candidate) => candidate.name === "radius.md"
  );

  assert.equal(token?.type, "radius");
  assert.equal(token?.value, 8);
  assert.equal(token?.unit, "px");
});

test("groups typography FontSize, LineHeight, and FontWeight records", () => {
  const document = buildCanonicalTokensFromRecords([
    numberRecord("typography.tokens.json", ["H1", "FontSize"], 32),
    numberRecord("typography.tokens.json", ["H1", "LineHeight"], 40),
    numberRecord("typography.tokens.json", ["H1", "FontWeight"], 700)
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

test("groups shadow geometry into mode-aware shadow tokens", () => {
  const document = buildCanonicalTokensFromRecords([
    numberRecord("semantics/light.tokens.json", ["Drop shadows - cards", "Position X"], 0),
    numberRecord("semantics/light.tokens.json", ["Drop shadows - cards", "Position Y"], 2),
    numberRecord("semantics/light.tokens.json", ["Drop shadows - cards", "Blur"], 8),
    numberRecord("semantics/light.tokens.json", ["Drop shadows - cards", "Spread"], 0),
    numberRecord("semantics/dark.tokens.json", ["Drop shadows - cards", "Position X"], 0),
    numberRecord("semantics/dark.tokens.json", ["Drop shadows - cards", "Position Y"], 3),
    numberRecord("semantics/dark.tokens.json", ["Drop shadows - cards", "Blur"], 12),
    numberRecord("semantics/dark.tokens.json", ["Drop shadows - cards", "Spread"], 1)
  ]);
  const token = collectCanonicalTokens(document).find(
    (candidate) => candidate.name === "shadow.card"
  );

  assert.equal(token?.type, "shadow");
  assert.equal(token?.cssVariable, "--ds-shadow-card");
  assert.deepEqual(token?.value, {
    light: {
      x: 0,
      y: 2,
      blur: 8,
      spread: 0,
      color: "#0F172A",
      opacity: 0.12
    },
    dark: {
      x: 0,
      y: 3,
      blur: 12,
      spread: 1,
      color: "#0F172A",
      opacity: 0.12
    }
  });
});

test("groups optional shadow colour and opacity when present", () => {
  const document = buildCanonicalTokensFromRecords([
    numberRecord("semantics/light.tokens.json", ["Drop shadows - cards", "Position X"], 0),
    numberRecord("semantics/light.tokens.json", ["Drop shadows - cards", "Position Y"], 2),
    numberRecord("semantics/light.tokens.json", ["Drop shadows - cards", "Blur"], 8),
    numberRecord("semantics/light.tokens.json", ["Drop shadows - cards", "Spread"], 0),
    colorRecord("semantics/light.tokens.json", ["Drop shadows - cards", "Colour"], "#334155"),
    numberRecord("semantics/light.tokens.json", ["Drop shadows - cards", "Opacity"], 0.2),
    numberRecord("semantics/dark.tokens.json", ["Drop shadows - cards", "Position X"], 0),
    numberRecord("semantics/dark.tokens.json", ["Drop shadows - cards", "Position Y"], 2),
    numberRecord("semantics/dark.tokens.json", ["Drop shadows - cards", "Blur"], 8),
    numberRecord("semantics/dark.tokens.json", ["Drop shadows - cards", "Spread"], 0),
    colorRecord("semantics/dark.tokens.json", ["Drop shadows - cards", "Colour"], "#020617"),
    numberRecord("semantics/dark.tokens.json", ["Drop shadows - cards", "Opacity"], 0.4)
  ]);
  const token = collectCanonicalTokens(document).find(
    (candidate) => candidate.name === "shadow.card"
  );

  assert.equal(token?.value.light.color, "#334155");
  assert.equal(token?.value.light.opacity, 0.2);
  assert.equal(token?.value.dark.color, "#020617");
  assert.equal(token?.value.dark.opacity, 0.4);
});

test("build report explains mapped, renamed, and skipped source records", () => {
  const { document, report } = buildCanonicalTokensFromRecordsWithReport([
    colorRecord("semantics/light.tokens.json", ["Font colours", "Default text"], "#083344"),
    colorRecord("semantics/dark.tokens.json", ["Font colours", "Default text"], "#fdfdfd"),
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
