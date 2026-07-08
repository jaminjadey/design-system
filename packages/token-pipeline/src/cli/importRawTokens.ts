#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { parseJsonText } from "../json/parseJsonText.js";
import { writeRawTokenImportOutput } from "../raw/importRawTokens.js";
import { parseRawTokenImportConfig } from "../raw/rawTokenImportConfig.js";

const invocationDirectory = process.env.INIT_CWD ?? process.cwd();

try {
  const cliOptions = parseArgs(process.argv.slice(2));
  const inputDirectory = resolve(invocationDirectory, cliOptions.input ?? ".private/design-system");
  const outputDirectory = resolve(
    invocationDirectory,
    cliOptions.output ?? ".private/normalised-token-output"
  );
  const configPath =
    cliOptions.config === undefined
      ? resolve(inputDirectory, "import.config.json")
      : resolve(invocationDirectory, cliOptions.config);

  const configText = await readFile(configPath, "utf8");
  const config = parseRawTokenImportConfig(
    parseJsonText(configText, `raw token import config ${configPath}`)
  );
  const report = await writeRawTokenImportOutput(inputDirectory, outputDirectory, config);

  console.log(`Imported raw tokens into ${outputDirectory}`);
  console.log(`Files read: ${report.filesRead}`);
  console.log(`Tokens imported: ${report.tokensImported}`);
  console.log(`Tokens skipped: ${report.tokensSkipped}`);
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

function parseArgs(args: readonly string[]): {
  readonly input?: string;
  readonly output?: string;
  readonly config?: string;
} {
  const options: { input?: string; output?: string; config?: string } = {};
  const positional: string[] = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--input") {
      options.input = readFlagValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--output") {
      options.output = readFlagValue(args, index, arg);
      index += 1;
      continue;
    }
    if (arg === "--config") {
      options.config = readFlagValue(args, index, arg);
      index += 1;
      continue;
    }
    positional.push(arg);
  }

  options.input ??= positional[0];
  options.output ??= positional[1];
  options.config ??= positional[2];
  return options;
}

function readFlagValue(args: readonly string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error(`${flag} requires a value`);
  }
  return value;
}
