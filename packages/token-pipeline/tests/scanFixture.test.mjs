import assert from "node:assert/strict";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  discoverFixtureFiles,
  formatSafetyFinding,
  scanFixtureDirectory,
  scanFixtureText
} from "../dist/index.js";

test("discovers fixture files recursively in stable order", async () => {
  const root = await mkdtemp(join(tmpdir(), "demo-ds-fixtures-"));
  await mkdir(join(root, "tokens"), { recursive: true });
  await writeFile(join(root, "tokens", "Light.tokens.json"), "{}\n");
  await writeFile(join(root, "README.md"), "Synthetic fixtures.\n");

  const files = await discoverFixtureFiles(root);

  assert.deepEqual(
    files.map((file) => file.relativePath),
    ["README.md", "tokens/Light.tokens.json"]
  );
  assert.ok(files.every((file) => file.isTextLike));
});

test("passes synthetic safe fixture text", () => {
  const findings = scanFixtureText({
    filePath: "tokens/Light.tokens.json",
    text: JSON.stringify({
      color: {
        semantic: {
          text: {
            default: {
              value: "#123456"
            }
          }
        }
      }
    })
  });

  assert.deepEqual(findings, []);
});

test("fails synthetic unsafe raw marker text with useful file and line details", () => {
  const findings = scanFixtureText({
    filePath: "tokens/Dark.tokens.json",
    text: "{\n  \"value\": \"PRIVATE_COMPANY_NAME_PLACEHOLDER\"\n}\n"
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].filePath, "tokens/Dark.tokens.json");
  assert.equal(findings[0].marker, "PRIVATE_COMPANY_NAME_PLACEHOLDER");
  assert.equal(findings[0].line, 2);
  assert.match(formatSafetyFinding(findings[0]), /tokens\/Dark\.tokens\.json:2:13/u);
});

test("fails synthetic unsafe JSON key metadata", () => {
  const findings = scanFixtureText({
    filePath: "primitives/Default.tokens.json",
    text: JSON.stringify({
      color: {
        "$extensions": {
          "com.figma": {
            VariableID: "unsafe"
          }
        }
      }
    })
  });

  assert.ok(findings.some((finding) => finding.marker === "$extensions"));
  assert.ok(findings.some((finding) => finding.marker === "com.figma"));
  assert.ok(findings.some((finding) => finding.marker === "VariableID"));
  assert.ok(findings.some((finding) => finding.jsonPath?.includes("$extensions")));
});

test("directory scan reports unsupported fixture files", async () => {
  const root = await mkdtemp(join(tmpdir(), "demo-ds-fixtures-"));
  await writeFile(join(root, "safe.json"), "{}\n");
  await writeFile(join(root, "logo.png"), "not a real image\n");

  const result = await scanFixtureDirectory({ rootDirectory: root });

  assert.equal(result.passed, false);
  assert.equal(result.filesDiscovered, 2);
  assert.equal(result.filesScanned, 1);
  assert.equal(result.unsupportedFiles, 1);
  assert.equal(result.findings[0].filePath, "logo.png");
});
