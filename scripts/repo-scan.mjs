import { readdir, readFile } from "node:fs/promises";
import { basename, extname, join, relative, sep } from "node:path";

import { defaultForbiddenMarkers } from "../packages/token-pipeline/dist/safety/forbiddenMarkers.js";
import {
  formatSafetyFinding,
  scanFixtureText
} from "../packages/token-pipeline/dist/safety/scanFixture.js";

const ignoredDirectories = new Set([
  ".git",
  ".private",
  ".turbo",
  "coverage",
  "node_modules",
  "storybook-static"
]);

const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mdx",
  ".mjs",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml"
]);

const assetExtensions = new Set([
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".otf",
  ".png",
  ".svg",
  ".ttf",
  ".webp",
  ".woff",
  ".woff2",
  ".zip"
]);

const allowedAssetFiles = new Set(["packages/tokens/fixtures/demo-design-token-fixtures.zip"]);

const markerAllowlist = new Map(
  [
    "docs/02-token-source-and-demo-fixtures.md",
    "docs/codex/prompt-02-fixtures-and-safety.md",
    "packages/token-pipeline/src/safety/forbiddenMarkers.ts",
    "packages/token-pipeline/dist/safety/forbiddenMarkers.js",
    "packages/token-pipeline/tests/scanFixture.test.mjs",
    "packages/tokens/tests/canonical.test.mjs"
  ].map((filePath) => [filePath, new Set(defaultForbiddenMarkers)])
);

const secretPatterns = [
  {
    name: "private-key",
    pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/u
  },
  {
    name: "github-token",
    pattern: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/u
  },
  {
    name: "github-fine-grained-token",
    pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/u
  },
  {
    name: "npm-token",
    pattern: /\bnpm_[A-Za-z0-9]{20,}\b/u
  },
  {
    name: "openai-key",
    pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/u
  }
];

const rootDirectory = process.cwd();
const files = await collectFiles(rootDirectory);
const findings = [];
let textFilesScanned = 0;

for (const absolutePath of files) {
  const relativePath = toPosix(relative(rootDirectory, absolutePath));
  const extension = extname(relativePath).toLowerCase();

  if (isForbiddenEnvFile(relativePath)) {
    findings.push(`${relativePath}: environment files must not be committed`);
  }

  if (assetExtensions.has(extension) && !allowedAssetFiles.has(relativePath)) {
    findings.push(`${relativePath}: binary or visual asset requires explicit review`);
    continue;
  }

  if (!textExtensions.has(extension)) {
    continue;
  }

  const text = await readFile(absolutePath, "utf8");
  textFilesScanned += 1;

  const markerFindings = scanFixtureText({
    filePath: relativePath,
    text,
    forbiddenMarkers: defaultForbiddenMarkers
  }).filter((finding) => !isAllowedMarkerFinding(relativePath, finding.marker));

  findings.push(...markerFindings.map(formatSafetyFinding));
  findings.push(...findSecretPatternFindings(relativePath, text));
}

if (findings.length > 0) {
  console.error("Repository safety scan failed:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log(`Repository safety scan passed for ${textFilesScanned} text files.`);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await collectFiles(absolutePath)));
      }
      continue;
    }

    if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

function isAllowedMarkerFinding(filePath, marker) {
  if (marker === undefined) {
    return false;
  }

  return markerAllowlist.get(filePath)?.has(marker) ?? false;
}

function isForbiddenEnvFile(filePath) {
  const fileName = basename(filePath);
  if (fileName === ".env.example") {
    return false;
  }

  return fileName === ".env" || fileName.startsWith(".env.");
}

function findSecretPatternFindings(filePath, text) {
  const findings = [];

  for (const { name, pattern } of secretPatterns) {
    const match = pattern.exec(text);
    if (match === null) {
      continue;
    }

    const location = getLineColumn(text, match.index);
    findings.push(
      `${filePath}:${location.line}:${location.column}: potential ${name} secret pattern found`
    );
  }

  return findings;
}

function getLineColumn(text, index) {
  const prefix = text.slice(0, index);
  const lines = prefix.split(/\r?\n/u);
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  };
}

function toPosix(filePath) {
  return filePath.split(sep).join("/");
}
