#!/usr/bin/env node
import { resolve } from "node:path";

import { buildCanonicalTokens } from "../canonical/buildCanonicalTokens.js";
import { generateTokenOutputs } from "../canonical/generateTokenOutputs.js";

const fixtureDirectory = resolve(process.cwd(), process.argv[2] ?? "./fixtures/extracted");
const outputDirectory = resolve(process.cwd(), process.argv[3] ?? "./dist");

try {
  const document = await buildCanonicalTokens({ fixtureDirectory });
  await generateTokenOutputs(document, { outputDirectory });
  console.log(`Generated canonical tokens: ${outputDirectory}/canonical.json`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Canonical token build failed: ${message}`);
  process.exitCode = 1;
}
