import {
  defaultCanonicalMappingConfig,
  type CanonicalMappingConfig
} from "../config/tokenPipelineConfig.js";
import { discoverFixtureFiles } from "../fixtures/discoverFixtureFiles.js";
import { cssVariableName, tokenName } from "../mapping/nameNormalisation.js";
import { sourcePathToCanonicalPath } from "../mapping/sourceToCanonical.js";
import { parseSourceTokenFile, type SourceTokenRecord } from "../source/sourceRecords.js";
import { normaliseColorValue } from "./color.js";
import type {
  CanonicalColorToken,
  CanonicalComponentToken,
  CanonicalDimensionToken,
  CanonicalShadowToken,
  CanonicalShadowValue,
  CanonicalToken,
  CanonicalTokenDocument,
  CanonicalTypographyToken,
  CanonicalTypographyValue,
  TokenMode
} from "./types.js";
import {
  collectCanonicalTokens,
  validateCanonicalTokenDocument
} from "./validateCanonicalTokens.js";

export interface BuildOptions {
  readonly fixtureDirectory: string;
  readonly config?: CanonicalMappingConfig;
}

export interface CanonicalBuildFinding {
  readonly file: string;
  readonly path: string;
  readonly message: string;
}

export interface CanonicalPathMappingReport {
  readonly file: string;
  readonly sourcePath: string;
  readonly canonicalPath: string;
  readonly category: SourceMappingCategory;
}

export interface SemanticModeMissingReport {
  readonly tokenName: string;
  readonly missingModes: readonly TokenMode[];
}

export interface CanonicalBuildReport {
  readonly sourceRecordsRead: number;
  readonly tokensGenerated: number;
  readonly recordsMapped: number;
  readonly recordsSkipped: number;
  readonly renamedPaths: readonly CanonicalPathMappingReport[];
  readonly unsupportedRecords: readonly CanonicalBuildFinding[];
  readonly semanticTokensMissingModes: readonly SemanticModeMissingReport[];
  readonly componentTokensMissingModes: readonly SemanticModeMissingReport[];
  readonly generatedFiles: readonly string[];
  readonly warnings: readonly CanonicalBuildFinding[];
}

type SourceMappingCategory =
  | "primitive-color"
  | "semantic-color"
  | "component-color"
  | "component-dimension"
  | "space"
  | "radius"
  | "shadow-part"
  | "typography-part";

export async function readSourceTokenRecords(
  fixtureDirectory: string,
  config: CanonicalMappingConfig = defaultCanonicalMappingConfig
): Promise<SourceTokenRecord[]> {
  const discovered = await discoverFixtureFiles(fixtureDirectory);
  const expectedJsonFiles = new Set(expectedSourceFiles(config));
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

export async function buildCanonicalTokens(options: BuildOptions): Promise<CanonicalTokenDocument> {
  const records = await readSourceTokenRecords(
    options.fixtureDirectory,
    options.config ?? defaultCanonicalMappingConfig
  );
  return buildCanonicalTokensFromRecords(records, { config: options.config });
}

export async function buildCanonicalTokensWithReport(
  options: BuildOptions
): Promise<{ readonly document: CanonicalTokenDocument; readonly report: CanonicalBuildReport }> {
  const config = options.config ?? defaultCanonicalMappingConfig;
  const records = await readSourceTokenRecords(options.fixtureDirectory, config);
  return buildCanonicalTokensFromRecordsWithReport(records, { config });
}

export function buildCanonicalTokensFromRecords(
  records: readonly SourceTokenRecord[],
  options: { readonly config?: CanonicalMappingConfig } = {}
): CanonicalTokenDocument {
  return buildCanonicalTokensFromRecordsWithReport(records, options).document;
}

export function buildCanonicalTokensFromRecordsWithReport(
  records: readonly SourceTokenRecord[],
  options: { readonly config?: CanonicalMappingConfig } = {}
): { readonly document: CanonicalTokenDocument; readonly report: CanonicalBuildReport } {
  const config = options.config ?? defaultCanonicalMappingConfig;
  const sourceRecordLookup = new Map(records.map((record) => [sourceRecordKey(record), record]));
  const primitiveColors: CanonicalColorToken[] = [];
  const semanticColors = new Map<string, MutableSemanticColor>();
  const componentColors = new Map<string, MutableComponentColor>();
  const componentDimensions: CanonicalComponentToken[] = [];
  const dimensions: CanonicalDimensionToken[] = [];
  const shadowParts = new Map<string, MutableShadowValue>();
  const typographyParts = new Map<string, MutableTypographyValue>();
  const renamedPaths: CanonicalPathMappingReport[] = [];
  const unsupportedRecords: CanonicalBuildFinding[] = [];
  const warnings: CanonicalBuildFinding[] = [];
  let recordsMapped = 0;

  for (const record of records) {
    const mapping = sourcePathToCanonicalPath(record, config);
    if (mapping === undefined) {
      const finding = {
        file: record.file,
        path: record.sourcePath.join("."),
        message: `No canonical mapping for ${record.type} source record`
      };
      unsupportedRecords.push(finding);
      warnings.push(finding);
      if (config.unsupportedTokenPolicy === "fail") {
        throw new Error(`${record.file}:${record.sourcePath.join(".")}: ${finding.message}`);
      }
      continue;
    }

    recordsMapped += 1;
    if (mapping.canonicalPath.join(".") !== record.sourcePath.join(".")) {
      renamedPaths.push({
        file: record.file,
        sourcePath: record.sourcePath.join("."),
        canonicalPath: mapping.canonicalPath.join("."),
        category: mapping.category
      });
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

    if (mapping.category === "component-color") {
      assertSourceType(record, "color");
      const name = tokenName(mapping.canonicalPath);
      const existing =
        componentColors.get(name) ??
        ({
          canonicalPath: mapping.canonicalPath,
          value: {},
          source: record
        } satisfies MutableComponentColor);
      existing.value[mapping.mode ?? "light"] = normaliseColorValue(
        resolveSourceValue(record, sourceRecordLookup)
      );
      componentColors.set(name, existing);
      continue;
    }

    if (mapping.category === "component-dimension") {
      assertSourceType(record, "number");
      componentDimensions.push(makeComponentDimensionToken(mapping.canonicalPath, record));
      continue;
    }

    if (mapping.category === "space" || mapping.category === "radius") {
      assertSourceType(record, "number");
      dimensions.push(makeDimensionToken(mapping.canonicalPath, mapping.category, record));
      continue;
    }

    if (mapping.category === "shadow-part") {
      const name = tokenName(mapping.canonicalPath);
      const existing = shadowParts.get(name) ?? {
        canonicalPath: mapping.canonicalPath,
        value: {},
        source: record
      };
      const mode = mapping.mode ?? "light";
      const modeValue =
        existing.value[mode] ??
        ({
          color: config.shadows.defaultColor,
          opacity: config.shadows.defaultOpacity
        } satisfies MutableShadowModeValue);

      applyShadowPart(modeValue, mapping.shadowProperty ?? "x", record, sourceRecordLookup);
      existing.value[mode] = modeValue;
      shadowParts.set(name, existing);
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
    const missingModes = (["light", "dark"] as const).filter(
      (mode) => entry.value[mode] === undefined
    );
    if (missingModes.length > 0) {
      throw new Error(
        `Semantic colour ${tokenName(entry.canonicalPath)} is missing light or dark value`
      );
    }

    const light = entry.value.light;
    const dark = entry.value.dark;
    if (light === undefined || dark === undefined) {
      throw new Error(
        `Semantic colour ${tokenName(entry.canonicalPath)} is missing light or dark value`
      );
    }

    return makeColorToken(entry.canonicalPath, { light, dark }, entry.source);
  });

  const componentColorTokens = [...componentColors.values()].map((entry) => {
    const missingModes = (["light", "dark"] as const).filter(
      (mode) => entry.value[mode] === undefined
    );
    if (missingModes.length > 0) {
      throw new Error(
        `Component token ${tokenName(entry.canonicalPath)} is missing light or dark value`
      );
    }

    const light = entry.value.light;
    const dark = entry.value.dark;
    if (light === undefined || dark === undefined) {
      throw new Error(
        `Component token ${tokenName(entry.canonicalPath)} is missing light or dark value`
      );
    }

    return makeComponentColorToken(entry.canonicalPath, { light, dark }, entry.source);
  });

  const typographyTokens = [...typographyParts.entries()].map(([name, value]) => {
    if (
      value.fontSize === undefined ||
      value.lineHeight === undefined ||
      value.fontWeight === undefined
    ) {
      throw new Error(`Typography token ${name} is missing FontSize, LineHeight, or FontWeight`);
    }

    return makeTypographyToken(
      name.split("."),
      {
        fontSize: value.fontSize,
        lineHeight: value.lineHeight,
        fontWeight: value.fontWeight
      },
      value.source
    );
  });

  const shadowTokens = [...shadowParts.values()].map((entry) => makeShadowTokenFromParts(entry));

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
      component: nestTokens(sortTokens([...componentColorTokens, ...componentDimensions]), [
        "component"
      ]),
      color: {
        primitive: nestTokens(sortTokens(primitiveColors), ["color", "primitive"]),
        semantic: nestTokens(sortTokens(semanticColorTokens), ["color", "semantic"])
      },
      space: nestTokens(sortTokens(dimensions.filter((token) => token.type === "dimension")), [
        "space"
      ]),
      radius: nestTokens(sortTokens(dimensions.filter((token) => token.type === "radius")), [
        "radius"
      ]),
      shadow: nestTokens(sortTokens(shadowTokens), ["shadow"]),
      typography: nestTokens(sortTokens(typographyTokens), ["typography"])
    }
  };

  validateCanonicalTokenDocument(document);
  const tokensGenerated = collectCanonicalTokens(document).length;

  return {
    document,
    report: {
      sourceRecordsRead: records.length,
      tokensGenerated,
      recordsMapped,
      recordsSkipped: records.length - recordsMapped,
      renamedPaths: renamedPaths.sort((left, right) =>
        `${left.file}:${left.sourcePath}`.localeCompare(`${right.file}:${right.sourcePath}`)
      ),
      unsupportedRecords,
      semanticTokensMissingModes: collectMissingSemanticModes(semanticColors),
      componentTokensMissingModes: collectMissingComponentModes(componentColors),
      generatedFiles: [],
      warnings
    }
  };
}

function applyShadowPart(
  value: MutableShadowModeValue,
  property: "x" | "y" | "blur" | "spread" | "color" | "opacity",
  record: SourceTokenRecord,
  sourceRecordLookup: ReadonlyMap<string, SourceTokenRecord>
): void {
  if (property === "color") {
    assertSourceType(record, "color");
    value.color = normaliseColorValue(resolveSourceValue(record, sourceRecordLookup));
    return;
  }

  assertSourceType(record, "number");
  value[property] = numberValue(record);
}

function makeShadowTokenFromParts(entry: MutableShadowValue): CanonicalShadowToken {
  const missingModes = (["light", "dark"] as const).filter(
    (mode) => entry.value[mode] === undefined
  );
  if (missingModes.length > 0) {
    throw new Error(
      `Shadow token ${tokenName(entry.canonicalPath)} is missing light or dark value`
    );
  }

  const light = completeShadowMode(entry.canonicalPath, "light", entry.value.light);
  const dark = completeShadowMode(entry.canonicalPath, "dark", entry.value.dark);
  return {
    name: tokenName(entry.canonicalPath),
    path: entry.canonicalPath,
    type: "shadow",
    value: { light, dark },
    cssVariable: cssVariableName(entry.canonicalPath),
    source: sourceFromRecord(entry.source)
  };
}

function completeShadowMode(
  path: readonly string[],
  mode: TokenMode,
  value: Partial<CanonicalShadowValue> | undefined
): CanonicalShadowValue {
  if (
    value === undefined ||
    value.x === undefined ||
    value.y === undefined ||
    value.blur === undefined ||
    value.spread === undefined ||
    value.color === undefined ||
    value.opacity === undefined
  ) {
    throw new Error(
      `Shadow token ${tokenName(path)} is missing x, y, blur, spread, color, or opacity for ${mode} mode`
    );
  }

  return {
    x: value.x,
    y: value.y,
    blur: value.blur,
    spread: value.spread,
    color: value.color,
    opacity: value.opacity
  };
}

export function withGeneratedFiles(
  report: CanonicalBuildReport,
  generatedFiles: readonly string[]
): CanonicalBuildReport {
  return {
    ...report,
    generatedFiles: [...generatedFiles].sort()
  };
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

function makeComponentColorToken(
  path: readonly string[],
  value: { readonly light: string; readonly dark: string },
  record: SourceTokenRecord
): CanonicalComponentToken {
  return {
    name: tokenName(path),
    path,
    type: "component",
    valueType: "color",
    value,
    cssVariable: cssVariableName(path),
    source: sourceFromRecord(record)
  };
}

function makeComponentDimensionToken(
  path: readonly string[],
  record: SourceTokenRecord
): CanonicalComponentToken {
  return {
    name: tokenName(path),
    path,
    type: "component",
    valueType: "dimension",
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

function sourceFromRecord(record: SourceTokenRecord): {
  readonly file: string;
  readonly path: string;
} {
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
    throw new Error(
      `Unresolved token reference ${record.value} at ${record.file}:${record.sourcePath.join(".")}`
    );
  }

  if (seen.has(referencedKey)) {
    throw new Error(
      `Circular token reference ${record.value} at ${record.file}:${record.sourcePath.join(".")}`
    );
  }

  return resolveSourceValue(referencedRecord, records, new Set([...seen, referencedKey]));
}

function sourceRecordKey(record: SourceTokenRecord): string {
  return `${record.file}:${record.sourcePath.join(".")}`;
}

function sortTokens<TToken extends CanonicalToken>(tokens: readonly TToken[]): TToken[] {
  return [...tokens].sort((left, right) => left.name.localeCompare(right.name));
}

function expectedSourceFiles(config: CanonicalMappingConfig): string[] {
  return [
    ...config.files.primitiveColors,
    ...config.files.semanticColors.map((entry) => entry.file),
    ...config.files.componentColors.map((entry) => entry.file),
    config.files.componentDimensions,
    config.files.spacing,
    config.files.radius,
    config.files.typography
  ].sort();
}

function collectMissingComponentModes(
  componentColors: ReadonlyMap<string, MutableComponentColor>
): readonly SemanticModeMissingReport[] {
  return collectMissingModeValues(componentColors);
}

function collectMissingSemanticModes(
  semanticColors: ReadonlyMap<string, MutableSemanticColor>
): readonly SemanticModeMissingReport[] {
  return collectMissingModeValues(semanticColors);
}

function collectMissingModeValues(
  modeAwareTokens: ReadonlyMap<string, MutableModeAwareColor>
): readonly SemanticModeMissingReport[] {
  return [...modeAwareTokens.values()]
    .map((entry) => ({
      tokenName: tokenName(entry.canonicalPath),
      missingModes: (["light", "dark"] as const).filter((mode) => entry.value[mode] === undefined)
    }))
    .filter((entry) => entry.missingModes.length > 0)
    .sort((left, right) => left.tokenName.localeCompare(right.tokenName));
}

function nestTokens(
  tokens: readonly CanonicalToken[],
  prefix: readonly string[]
): Record<string, unknown> {
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

type MutableComponentColor = MutableModeAwareColor;

interface MutableModeAwareColor {
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

interface MutableShadowValue {
  readonly canonicalPath: readonly string[];
  readonly value: Partial<Record<TokenMode, MutableShadowModeValue>>;
  readonly source: SourceTokenRecord;
}

interface MutableShadowModeValue {
  x?: number;
  y?: number;
  blur?: number;
  spread?: number;
  color?: string;
  opacity?: number;
}
