#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { writeRawTokenImportOutput } from "../raw/importRawTokens.js";
import { parseRawTokenImportConfig } from "../raw/rawTokenImportConfig.js";

const invocationDirectory = process.env.INIT_CWD ?? process.cwd();
const inputDirectory = resolve(invocationDirectory, process.argv[2] ?? ".private/design-system");
const outputDirectory = resolve(invocationDirectory, process.argv[3] ?? ".private/normalised-token-output");
const configPath =
  process.argv[4] === undefined
    ? resolve(inputDirectory, "import.config.json")
    : resolve(invocationDirectory, process.argv[4]);

try {
  const configText = await readFile(configPath, "utf8");
  const config = parseRawTokenImportConfig(JSON.parse(configText));
  const report = await writeRawTokenImportOutput(inputDirectory, outputDirectory, config);

  console.log(`Imported raw tokens into ${outputDirectory}`);
  console.log(`Files read: ${report.filesRead}`);
  console.log(`Records emitted: ${report.recordsEmitted}`);
  console.log(`Metadata keys stripped: ${report.metadataKeysStripped}`);
  console.log(`Aliases resolved: ${report.aliasesResolved}`);
  console.log(`Warnings: ${report.warnings.length}`);
  console.log(`Report: ${outputDirectory}/import-report.json`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Raw token import failed: ${message}`);
  process.exitCode = 1;
}
