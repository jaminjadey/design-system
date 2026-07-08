import { readFile } from "node:fs/promises";

import { discoverFixtureFiles } from "../fixtures/discoverFixtureFiles.js";
import { parseJsonText } from "../json/parseJsonText.js";
import { defaultForbiddenMarkers, type ForbiddenMarker } from "./forbiddenMarkers.js";

export type SafetyFindingKind = "forbidden-marker" | "unsupported-file";

export interface SafetyFinding {
  readonly kind: SafetyFindingKind;
  readonly filePath: string;
  readonly marker?: string;
  readonly line?: number;
  readonly column?: number;
  readonly jsonPath?: string;
  readonly message: string;
}

export interface SafetyScanResult {
  readonly rootDirectory: string;
  readonly filesDiscovered: number;
  readonly filesScanned: number;
  readonly unsupportedFiles: number;
  readonly findings: readonly SafetyFinding[];
  readonly passed: boolean;
}

export interface ScanFixtureDirectoryOptions {
  readonly rootDirectory: string;
  readonly forbiddenMarkers?: readonly ForbiddenMarker[];
}

export interface ScanFixtureTextOptions {
  readonly filePath: string;
  readonly text: string;
  readonly forbiddenMarkers?: readonly ForbiddenMarker[];
}

export async function scanFixtureDirectory(
  options: ScanFixtureDirectoryOptions
): Promise<SafetyScanResult> {
  const forbiddenMarkers = options.forbiddenMarkers ?? defaultForbiddenMarkers;
  const files = await discoverFixtureFiles(options.rootDirectory);
  const findings: SafetyFinding[] = [];
  let filesScanned = 0;
  let unsupportedFiles = 0;

  for (const file of files) {
    if (!file.isTextLike) {
      unsupportedFiles += 1;
      findings.push({
        kind: "unsupported-file",
        filePath: file.relativePath,
        message: `Unsupported non-text fixture file: ${file.relativePath}`
      });
      continue;
    }

    filesScanned += 1;
    const text = await readFile(file.absolutePath, "utf8");
    findings.push(
      ...scanFixtureText({
        filePath: file.relativePath,
        text,
        forbiddenMarkers
      })
    );
  }

  return {
    rootDirectory: options.rootDirectory,
    filesDiscovered: files.length,
    filesScanned,
    unsupportedFiles,
    findings,
    passed: findings.length === 0
  };
}

export function scanFixtureText(options: ScanFixtureTextOptions): SafetyFinding[] {
  const forbiddenMarkers = options.forbiddenMarkers ?? defaultForbiddenMarkers;
  const findings: SafetyFinding[] = [];

  for (const marker of forbiddenMarkers) {
    let searchStart = 0;
    while (searchStart < options.text.length) {
      const index = options.text.indexOf(marker, searchStart);
      if (index === -1) {
        break;
      }

      const location = getLineColumn(options.text, index);
      findings.push({
        kind: "forbidden-marker",
        filePath: options.filePath,
        marker,
        line: location.line,
        column: location.column,
        message: `Forbidden marker "${marker}" found in ${options.filePath}:${location.line}:${location.column}`
      });
      searchStart = index + marker.length;
    }
  }

  if (isJsonFile(options.filePath)) {
    findings.push(...scanJsonKeys(options.filePath, options.text, forbiddenMarkers));
  }

  return dedupeFindings(findings);
}

export function formatSafetyFinding(finding: SafetyFinding): string {
  if (finding.kind === "unsupported-file") {
    return `${finding.filePath}: ${finding.message}`;
  }

  const location =
    finding.line === undefined || finding.column === undefined
      ? finding.filePath
      : `${finding.filePath}:${finding.line}:${finding.column}`;
  const jsonPath = finding.jsonPath === undefined ? "" : ` (${finding.jsonPath})`;
  return `${location}: ${finding.message}${jsonPath}`;
}

function scanJsonKeys(
  filePath: string,
  text: string,
  forbiddenMarkers: readonly ForbiddenMarker[]
): SafetyFinding[] {
  let parsed: unknown;
  try {
    parsed = parseJsonText(text, filePath);
  } catch {
    return [];
  }

  const findings: SafetyFinding[] = [];
  visitJsonKeys(parsed, "$", (key, jsonPath) => {
    for (const marker of forbiddenMarkers) {
      if (key.includes(marker)) {
        findings.push({
          kind: "forbidden-marker",
          filePath,
          marker,
          jsonPath,
          message: `Forbidden JSON key marker "${marker}" found in ${filePath}`
        });
      }
    }
  });
  return findings;
}

function visitJsonKeys(
  value: unknown,
  path: string,
  visit: (key: string, jsonPath: string) => void
): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => visitJsonKeys(item, `${path}[${index}]`, visit));
    return;
  }

  if (value === null || typeof value !== "object") {
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    visit(key, childPath);
    visitJsonKeys(child, childPath, visit);
  }
}

function getLineColumn(text: string, index: number): { readonly line: number; readonly column: number } {
  const prefix = text.slice(0, index);
  const lines = prefix.split(/\r?\n/u);
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1
  };
}

function isJsonFile(filePath: string): boolean {
  return filePath.toLowerCase().endsWith(".json");
}

function dedupeFindings(findings: readonly SafetyFinding[]): SafetyFinding[] {
  const seen = new Set<string>();
  const deduped: SafetyFinding[] = [];

  for (const finding of findings) {
    const key = [
      finding.kind,
      finding.filePath,
      finding.marker ?? "",
      finding.line ?? "",
      finding.column ?? "",
      finding.jsonPath ?? ""
    ].join("|");

    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(finding);
    }
  }

  return deduped;
}
