import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  buildCanonicalTokensFromRecords,
  collectCanonicalTokens,
  importRawTokenDirectory,
  importRawTokenDocuments,
  parseJsonText,
  parseRawTokenImportConfig,
  writeRawTokenImportOutput
} from "../dist/index.js";

const fixtureDirectory = fileURLToPath(new URL("fixtures/raw-figma-export/", import.meta.url));

test("imports synthetic raw export into canonical colours, modes, dimensions, and typography", async () => {
  const config = await readFixtureConfig();
  const result = await importRawTokenDirectory(fixtureDirectory, config);
  const document = buildCanonicalTokensFromRecords(result.records);
  const tokens = collectCanonicalTokens(document);

  assert.equal(tokenValue(tokens, "color.primitive.primary.50"), "#E0F2FE");
  assert.equal(tokenValue(tokens, "color.primitive.primary.brand"), "#0284C7");
  assert.deepEqual(tokenValue(tokens, "color.semantic.text.default"), {
    light: "#0F172A",
    dark: "#F8FAFC"
  });
  assert.equal(tokenValue(tokens, "space.sm"), 8);
  assert.equal(tokenValue(tokens, "radius.md"), 8);
  assert.deepEqual(tokenValue(tokens, "typography.heading.h2"), {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 600
  });
  assert.equal(result.report.filesRead, 6);
  assert.equal(result.report.tokensImported, 74);
  assert.equal(result.report.tokensSkipped, 0);
  assert.ok(result.report.aliasesResolved > 0);
});

test("writes normalised source files and import report deterministically", async () => {
  const config = await readFixtureConfig();
  const outputDirectory = await mkdtemp(join(tmpdir(), "demo-ds-raw-import-"));

  const report = await writeRawTokenImportOutput(fixtureDirectory, outputDirectory, config);
  const primitiveText = await readFile(
    join(outputDirectory, "primitives", "colours.tokens.json"),
    "utf8"
  );
  const reportText = await readFile(join(outputDirectory, "import-report.json"), "utf8");

  assert.match(primitiveText, /"\$type": "color"/u);
  assert.match(primitiveText, /"#e0f2fe"/u);
  assert.equal(report.recordsEmitted, JSON.parse(reportText).recordsEmitted);
});

test("imports raw token files written with a UTF-8 byte order mark", async () => {
  const outputDirectory = await mkdtemp(join(tmpdir(), "demo-ds-raw-import-output-"));
  const inputDirectory = await mkdtemp(join(tmpdir(), "demo-ds-raw-import-input-"));
  const sourcePath = join(inputDirectory, "primitives", "colours.tokens.json");

  await mkdir(dirname(sourcePath), { recursive: true });
  await writeFile(
    sourcePath,
    `\uFEFF${JSON.stringify({
      Colour: {
        Primary: {
          $type: "color",
          $value: "#0284c7"
        }
      }
    })}`,
    "utf8"
  );

  const report = await writeRawTokenImportOutput(inputDirectory, outputDirectory, {
    files: [
      {
        source: "primitives/colours.tokens.json",
        target: "primitives/colours.tokens.json",
        stripPathPrefix: ["Colour"]
      }
    ]
  });

  assert.equal(report.tokensImported, 1);
  assert.equal(report.recordsEmitted, 1);
});

test("imports synthetic raw component tokens into component source files", () => {
  const result = importRawTokenDocuments(
    [
      {
        source: "components-light.raw.json",
        target: "components/light.tokens.json",
        value: {
          Button: {
            Primary: {
              High: {
                Background: "#155e75"
              }
            }
          }
        }
      },
      {
        source: "components-dimensions.raw.json",
        target: "components/dimensions.tokens.json",
        value: {
          Button: {
            Height: {
              Md: "36"
            }
          }
        }
      }
    ],
    {
      files: [
        {
          source: "components-light.raw.json",
          target: "components/light.tokens.json"
        },
        {
          source: "components-dimensions.raw.json",
          target: "components/dimensions.tokens.json"
        }
      ]
    }
  );

  assert.deepEqual(result.records, [
    {
      file: "components/dimensions.tokens.json",
      sourcePath: ["Button", "Height", "Md"],
      type: "number",
      value: 36
    },
    {
      file: "components/light.tokens.json",
      sourcePath: ["Button", "Primary", "High", "Background"],
      type: "color",
      value: "#155e75"
    }
  ]);
});

test("parses private import config files written with a UTF-8 byte order mark", () => {
  const config = parseRawTokenImportConfig(
    parseJsonText(
      '\uFEFF{"files":[{"source":"source.tokens.json","target":"target.tokens.json"}]}',
      "raw token import config"
    )
  );

  assert.equal(config.files[0].source, "source.tokens.json");
  assert.equal(config.files[0].target, "target.tokens.json");
});

test("strips raw metadata keys before emitting normalised source tokens", () => {
  const result = importRawTokenDocuments(
    [
      {
        source: "metadata.raw.json",
        target: "primitives/colours.tokens.json",
        stripPathPrefix: ["Primitive colours"],
        value: {
          "Primitive colours": {
            Primary: {
              600: {
                Hex: "#0284c7",
                $extensions: {
                  "com.figma": {
                    VariableID: "synthetic-id"
                  }
                },
                VariableCollectionId: "synthetic-collection",
                targetVariable: "synthetic-target"
              }
            }
          }
        }
      }
    ],
    {
      files: [
        {
          source: "metadata.raw.json",
          target: "primitives/colours.tokens.json",
          stripPathPrefix: ["Primitive colours"]
        }
      ]
    }
  );

  const normalised = JSON.stringify(result.normalisedFiles.get("primitives/colours.tokens.json"));
  assert.equal(result.report.metadataKeysStripped, 3);
  assert.doesNotMatch(
    normalised,
    /\$extensions|com\.figma|VariableID|VariableCollectionId|targetVariable/u
  );
  assert.deepEqual(result.records[0], {
    file: "primitives/colours.tokens.json",
    sourcePath: ["Primary", "600"],
    type: "color",
    value: {
      hex: "#0284c7"
    }
  });
});

test("rejects forbidden marker values in raw exports", () => {
  assert.throws(
    () =>
      importRawTokenDocuments(
        [
          {
            source: "unsafe.raw.json",
            target: "primitives/colours.tokens.json",
            value: {
              "Primitive colours": {
                Primary: {
                  600: {
                    Hex: "#0284c7",
                    Name: "PRIVATE_COMPANY_NAME_PLACEHOLDER"
                  }
                }
              }
            }
          }
        ],
        {
          files: [
            {
              source: "unsafe.raw.json",
              target: "primitives/colours.tokens.json"
            }
          ]
        }
      ),
    /forbidden marker PRIVATE_COMPANY_NAME_PLACEHOLDER/u
  );
});

test("fails explicit unsupported design token types by default", () => {
  assert.throws(
    () =>
      importRawTokenDocuments(
        [
          {
            source: "unsupported.raw.json",
            target: "primitives/colours.tokens.json",
            value: {
              Effects: {
                Card: {
                  $type: "shadow",
                  $value: "0 1px 2px rgb(15 23 42 / 12%)"
                }
              }
            }
          }
        ],
        {
          files: [
            {
              source: "unsupported.raw.json",
              target: "primitives/colours.tokens.json"
            }
          ]
        }
      ),
    /Unsupported design token type shadow/u
  );
});

test("can report unsupported raw token findings with useful file and path details", () => {
  const result = importRawTokenDocuments(
    [
      {
        source: "unsupported.raw.json",
        target: "primitives/colours.tokens.json",
        value: {
          Effects: {
            Card: {
              $type: "shadow",
              $value: "0 1px 2px rgb(15 23 42 / 12%)"
            }
          }
        }
      }
    ],
    {
      unsupportedTokenPolicy: "warn",
      files: [
        {
          source: "unsupported.raw.json",
          target: "primitives/colours.tokens.json"
        }
      ]
    }
  );

  assert.equal(result.records.length, 0);
  assert.equal(result.report.tokensImported, 0);
  assert.equal(result.report.tokensSkipped, 1);
  assert.deepEqual(result.report.warnings[0], {
    file: "unsupported.raw.json",
    path: "Effects.Card",
    message: "Unsupported design token type shadow"
  });
});

async function readFixtureConfig() {
  const text = await readFile(join(fixtureDirectory, "import.config.json"), "utf8");
  return parseRawTokenImportConfig(JSON.parse(text));
}

function tokenValue(tokens, name) {
  const token = tokens.find((candidate) => candidate.name === name);
  assert.ok(token, `Missing token ${name}`);
  return token.value;
}
