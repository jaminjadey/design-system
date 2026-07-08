#!/usr/bin/env node
import { writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import {
  buildCanonicalTokensWithReport,
  withGeneratedFiles
} from "../canonical/buildCanonicalTokens.js";
import { generateTokenOutputs } from "../canonical/generateTokenOutputs.js";
import {
  defaultTokenPipelineConfig,
  loadTokenPipelineConfig
} from "../config/tokenPipelineConfig.js";

const fixtureDirectory = resolve(process.cwd(), process.argv[2] ?? "./fixtures/extracted");
const outputDirectory = resolve(process.cwd(), process.argv[3] ?? "./dist");
const configPath = process.argv[4] === undefined ? undefined : resolve(process.cwd(), process.argv[4]);

try {
  const config =
    configPath === undefined ? defaultTokenPipelineConfig : await loadTokenPipelineConfig(configPath);
  const { document, report } = await buildCanonicalTokensWithReport({
    fixtureDirectory,
    config: config.canonical
  });
  const outputReport = await generateTokenOutputs(document, { outputDirectory });
  const buildReport = withGeneratedFiles(report, [...outputReport.files, "build-report.json"]);
  await writeFile(join(outputDirectory, "build-report.json"), `${JSON.stringify(buildReport, null, 2)}\n`, "utf8");
  console.log(`Generated canonical tokens: ${outputDirectory}/canonical.json`);
  console.log(`Generated build report: ${outputDirectory}/build-report.json`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Canonical token build failed: ${message}`);
  process.exitCode = 1;
}
