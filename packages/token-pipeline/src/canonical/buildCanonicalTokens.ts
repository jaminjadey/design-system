import { discoverFixtureFiles } from "../fixtures/discoverFixtureFiles.js";
import { cssVariableName, tokenName } from "../mapping/nameNormalisation.js";
import { sourcePathToCanonicalPath } from "../mapping/sourceToCanonical.js";
import { parseSourceTokenFile, type SourceTokenRecord } from "../source/sourceRecords.js";
import { normaliseColorValue } from "./color.js";
import type {
  CanonicalColorToken,
  CanonicalDimensionToken,
  CanonicalToken,
  CanonicalTokenDocument,
  CanonicalTypographyToken,
  CanonicalTypographyValue,
  TokenMode
} from "./types.js";
import { validateCanonicalTokenDocument } from "./validateCanonicalTokens.js";

export interface BuildOptions {
  readonly fixtureDirectory: string;
}

const expectedJsonFiles = new Set([
  "primitives/Default.tokens.json",
  "tokens/Light.tokens.json",
  "tokens/Dark.tokens.json",
  "spacing/Mode 1.tokens.json",
  "corners/Mode 1.tokens.json",
  "typography/Default.tokens.json"
]);

export async function readSourceTokenRecords(
  fixtureDirectory: string
): Promise<SourceTokenRecord[]> {
  const discovered = await discoverFixtureFiles(fixtureDirectory);
  const jsonFiles = discovered.filter((file) => expectedJsonFiles.has(file.relativePath));
  const missing = [...expectedJsonFiles].filter(
    (expectedFile) => !jsonFiles.some((file) => file.relativePath === expectedFile)
  );

  if (missing.length > 0) {
    throw new Error(`Missing expected fixture files: ${missing.join(", ")}`);
  }

  const recordGroups = await Promise.all(
    jsonFiles.map((file) => parseSourceTokenFile(file.absolutePath, file.relativePath))
  );
  return recordGroups.flat();
}

export async function buildCanonicalTokens(
  options: BuildOptions
): Promise<CanonicalTokenDocument> {
  const records = await readSourceTokenRecords(options.fixtureDirectory);
  return buildCanonicalTokensFromRecords(records);
}

export function buildCanonicalTokensFromRecords(
  records: readonly SourceTokenRecord[]
): CanonicalTokenDocument {
  const sourceRecordLookup = new Map(records.map((record) => [sourceRecordKey(record), record]));
  const primitiveColors: CanonicalColorToken[] = [];
  const semanticColors = new Map<string, MutableSemanticColor>();
  const dimensions: CanonicalDimensionToken[] = [];
  const typographyParts = new Map<string, MutableTypographyValue>();

  for (const record of records) {
    const mapping = sourcePathToCanonicalPath(record);
    if (mapping === undefined) {
      continue;
    }

    if (mapping.category === "primitive-color") {
      assertSourceType(record, "color");
      primitiveColors.push(
        makeColorToken(
          mapping.canonicalPath,
          normaliseColorValue(resolveSourceValue(record, sourceRecordLookup)),
          record
        )
      );
      continue;
    }

    if (mapping.category === "semantic-color") {
      assertSourceType(record, "color");
      const name = tokenName(mapping.canonicalPath);
      const existing =
        semanticColors.get(name) ??
        ({
          canonicalPath: mapping.canonicalPath,
          value: {},
          source: record
        } satisfies MutableSemanticColor);
      existing.value[mapping.mode ?? "light"] = normaliseColorValue(
        resolveSourceValue(record, sourceRecordLookup)
      );
      semanticColors.set(name, existing);
      continue;
    }

    if (mapping.category === "space" || mapping.category === "radius") {
      assertSourceType(record, "number");
      dimensions.push(makeDimensionToken(mapping.canonicalPath, mapping.category, record));
      continue;
    }

    if (mapping.category === "typography-part") {
      assertSourceType(record, "number");
      const name = tokenName(mapping.canonicalPath);
      const existing = typographyParts.get(name) ?? { source: record };
      existing[mapping.typographyProperty ?? "fontSize"] = numberValue(record);
      typographyParts.set(name, existing);
    }
  }

  const semanticColorTokens = [...semanticColors.values()].map((entry) => {
    if (entry.value.light === undefined || entry.value.dark === undefined) {
      throw new Error(`Semantic colour ${tokenName(entry.canonicalPath)} is missing light or dark value`);
    }

    return makeColorToken(entry.canonicalPath, { light: entry.value.light, dark: entry.value.dark }, entry.source);
  });

  const typographyTokens = [...typographyParts.entries()].map(([name, value]) => {
    if (
      value.fontSize === undefined ||
      value.lineHeight === undefined ||
      value.fontWeight === undefined
    ) {
      throw new Error(`Typography token ${name} is missing FontSize, LineHeight, or FontWeight`);
    }

    return makeTypographyToken(name.split("."), {
      fontSize: value.fontSize,
      lineHeight: value.lineHeight,
      fontWeight: value.fontWeight
    }, value.source);
  });

  const document: CanonicalTokenDocument = {
    $schema: "https://example.local/schemas/canonical-tokens.schema.json",
    meta: {
      name: "demo-design-system-tokens",
      version: "0.1.0",
      generatedAt: "1970-01-01T00:00:00.000Z",
      source: "demo-design-token-fixtures",
      generator: "@demo-ds/token-pipeline"
    },
    modes: ["light", "dark"],
    tokens: {
      color: {
        primitive: nestTokens(sortTokens(primitiveColors), ["color", "primitive"]),
        semantic: nestTokens(sortTokens(semanticColorTokens), ["color", "semantic"])
      },
      space: nestTokens(
        sortTokens(dimensions.filter((token) => token.type === "dimension")),
        ["space"]
      ),
      radius: nestTokens(
        sortTokens(dimensions.filter((token) => token.type === "radius")),
        ["radius"]
      ),
      typography: nestTokens(sortTokens(typographyTokens), ["typography"])
    }
  };

  validateCanonicalTokenDocument(document);
  return document;
}

function makeColorToken(
  path: readonly string[],
  value: CanonicalColorToken["value"],
  record: SourceTokenRecord
): CanonicalColorToken {
  return {
    name: tokenName(path),
    path,
    type: "color",
    value,
    cssVariable: cssVariableName(path),
    source: sourceFromRecord(record)
  };
}

function makeDimensionToken(
  path: readonly string[],
  category: "space" | "radius",
  record: SourceTokenRecord
): CanonicalDimensionToken {
  return {
    name: tokenName(path),
    path,
    type: category === "space" ? "dimension" : "radius",
    value: numberValue(record),
    unit: "px",
    cssVariable: cssVariableName(path),
    source: sourceFromRecord(record)
  };
}

function makeTypographyToken(
  path: readonly string[],
  value: CanonicalTypographyValue,
  record: SourceTokenRecord
): CanonicalTypographyToken {
  return {
    name: tokenName(path),
    path,
    type: "typography",
    value,
    source: sourceFromRecord(record)
  };
}

function sourceFromRecord(record: SourceTokenRecord): { readonly file: string; readonly path: string } {
  return {
    file: record.file,
    path: record.sourcePath.join(".")
  };
}

function assertSourceType(record: SourceTokenRecord, expectedType: string): void {
  if (record.type !== expectedType) {
    throw new Error(
      `Expected ${expectedType} token at ${record.file}:${record.sourcePath.join(".")}, got ${record.type}`
    );
  }
}

function numberValue(record: SourceTokenRecord): number {
  if (typeof record.value !== "number" || !Number.isFinite(record.value)) {
    throw new Error(`Expected numeric value at ${record.file}:${record.sourcePath.join(".")}`);
  }
  return record.value;
}

function resolveSourceValue(
  record: SourceTokenRecord,
  records: ReadonlyMap<string, SourceTokenRecord>,
  seen: ReadonlySet<string> = new Set()
): unknown {
  if (typeof record.value !== "string") {
    return record.value;
  }

  const referenceMatch = /^\{(.+)\}$/u.exec(record.value.trim());
  if (referenceMatch === null) {
    return record.value;
  }

  const referencedPath = referenceMatch[1].split(".");
  const referencedKey = `${record.file}:${referencedPath.join(".")}`;
  const referencedRecord = records.get(referencedKey);
  if (referencedRecord === undefined) {
    throw new Error(`Unresolved token reference ${record.value} at ${record.file}:${record.sourcePath.join(".")}`);
  }

  if (seen.has(referencedKey)) {
    throw new Error(`Circular token reference ${record.value} at ${record.file}:${record.sourcePath.join(".")}`);
  }

  return resolveSourceValue(referencedRecord, records, new Set([...seen, referencedKey]));
}

function sourceRecordKey(record: SourceTokenRecord): string {
  return `${record.file}:${record.sourcePath.join(".")}`;
}

function sortTokens<TToken extends CanonicalToken>(tokens: readonly TToken[]): TToken[] {
  return [...tokens].sort((left, right) => left.name.localeCompare(right.name));
}

function nestTokens(tokens: readonly CanonicalToken[], prefix: readonly string[]): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  for (const token of tokens) {
    const path = token.path.slice(prefix.length);
    let cursor = root;
    for (const segment of path.slice(0, -1)) {
      const existing = cursor[segment];
      if (existing === undefined) {
        cursor[segment] = {};
      }
      cursor = cursor[segment] as Record<string, unknown>;
    }

    cursor[path[path.length - 1]] = token;
  }

  return root;
}

interface MutableSemanticColor {
  readonly canonicalPath: readonly string[];
  readonly value: Partial<Record<TokenMode, string>>;
  readonly source: SourceTokenRecord;
}

interface MutableTypographyValue {
  fontSize?: number;
  lineHeight?: number;
  fontWeight?: number;
  source: SourceTokenRecord;
}
