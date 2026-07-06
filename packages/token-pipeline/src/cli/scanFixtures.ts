#!/usr/bin/env node
import { resolve } from "node:path";

import { formatSafetyFinding, scanFixtureDirectory } from "../safety/scanFixture.js";

const fixtureDirectory = resolve(process.cwd(), process.argv[2] ?? "../tokens/fixtures/extracted");

try {
  const result = await scanFixtureDirectory({ rootDirectory: fixtureDirectory });

  if (result.passed) {
    console.log("Fixture safety scan passed");
  } else {
    console.error("Fixture safety scan failed");
  }

  console.log(`Fixture directory: ${fixtureDirectory}`);
  console.log(`Files discovered: ${result.filesDiscovered}`);
  console.log(`Files scanned: ${result.filesScanned}`);
  console.log(`Forbidden markers found: ${result.findings.length - result.unsupportedFiles}`);
  console.log(`Unsupported binary files found: ${result.unsupportedFiles}`);

  if (!result.passed) {
    console.error("");
    for (const finding of result.findings) {
      console.error(formatSafetyFinding(finding));
    }
    process.exitCode = 1;
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fixture safety scan failed: ${message}`);
  process.exitCode = 1;
}
