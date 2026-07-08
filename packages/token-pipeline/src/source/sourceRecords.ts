import { readFile } from "node:fs/promises";

import { parseJsonText } from "../json/parseJsonText.js";

export interface SourceTokenRecord {
  readonly file: string;
  readonly sourcePath: readonly string[];
  readonly type: string;
  readonly value: unknown;
}

interface SourceTokenNode {
  readonly $type?: unknown;
  readonly $value?: unknown;
}

export async function parseSourceTokenFile(
  filePath: string,
  relativeFilePath: string
): Promise<SourceTokenRecord[]> {
  const text = await readFile(filePath, "utf8");
  const parsed = parseJsonText(text, relativeFilePath);

  return flattenSourceTokens(parsed, relativeFilePath);
}

export function flattenSourceTokens(value: unknown, file: string): SourceTokenRecord[] {
  const records: SourceTokenRecord[] = [];
  visitSourceNode(value, [], file, records);
  return records;
}

function visitSourceNode(
  value: unknown,
  sourcePath: readonly string[],
  file: string,
  records: SourceTokenRecord[]
): void {
  if (!isObject(value)) {
    return;
  }

  if ("$type" in value || "$value" in value) {
    const token = value as SourceTokenNode;
    if (typeof token.$type !== "string") {
      throw new Error(`Source token ${formatSource(file, sourcePath)} is missing string $type`);
    }
    if (!("$value" in token)) {
      throw new Error(`Source token ${formatSource(file, sourcePath)} is missing $value`);
    }

    records.push({
      file,
      sourcePath,
      type: token.$type,
      value: token.$value
    });
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    visitSourceNode(child, [...sourcePath, key], file, records);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function formatSource(file: string, sourcePath: readonly string[]): string {
  return `${file}:${sourcePath.join(".")}`;
}
