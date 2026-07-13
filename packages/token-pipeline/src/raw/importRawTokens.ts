import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

import { parseJsonText } from "../json/parseJsonText.js";
import { defaultForbiddenMarkers } from "../safety/forbiddenMarkers.js";
import type { SourceTokenRecord } from "../source/sourceRecords.js";
import {
  defaultMetadataKeysToStrip,
  type RawTokenImportConfig,
  type RawTokenImportFileRule
} from "./rawTokenImportConfig.js";

export interface RawTokenImportDocument {
  readonly source: string;
  readonly target: string;
  readonly value: unknown;
  readonly stripPathPrefix?: readonly string[];
}

export interface RawTokenImportFinding {
  readonly file: string;
  readonly path: string;
  readonly message: string;
}

export interface RawTokenImportFileReport {
  readonly source: string;
  readonly target: string;
  readonly tokensImported: number;
  readonly tokensSkipped: number;
  readonly recordsEmitted: number;
  readonly metadataKeysStripped: number;
  readonly aliasesResolved: number;
  readonly warnings: readonly RawTokenImportFinding[];
}

export interface RawTokenImportReport {
  readonly filesRead: number;
  readonly tokensImported: number;
  readonly tokensSkipped: number;
  readonly recordsEmitted: number;
  readonly metadataKeysStripped: number;
  readonly aliasesResolved: number;
  readonly warnings: readonly RawTokenImportFinding[];
  readonly files: readonly RawTokenImportFileReport[];
}

export interface RawTokenImportResult {
  readonly records: readonly SourceTokenRecord[];
  readonly report: RawTokenImportReport;
  readonly normalisedFiles: ReadonlyMap<string, unknown>;
}

interface SanitisedRawDocument extends RawTokenImportDocument {
  readonly index: number;
  readonly rule: RawTokenImportFileRule;
  readonly value: unknown;
}

interface MutableFileReport {
  source: string;
  target: string;
  tokensImported: number;
  tokensSkipped: number;
  recordsEmitted: number;
  metadataKeysStripped: number;
  aliasesResolved: number;
  warnings: RawTokenImportFinding[];
}

interface MutableReport {
  filesRead: number;
  tokensImported: number;
  tokensSkipped: number;
  recordsEmitted: number;
  metadataKeysStripped: number;
  aliasesResolved: number;
  warnings: RawTokenImportFinding[];
  files: MutableFileReport[];
}

interface IndexedRawNode {
  readonly document: SanitisedRawDocument;
  readonly path: readonly string[];
  readonly value: unknown;
}

interface ImportContext {
  readonly config: Required<Pick<RawTokenImportConfig, "unsupportedTokenPolicy">>;
  readonly documents: readonly SanitisedRawDocument[];
  readonly fileReports: readonly MutableFileReport[];
  readonly rawNodesByPath: ReadonlyMap<string, readonly IndexedRawNode[]>;
}

interface RawTokenValue {
  readonly type: "color" | "number";
  readonly value: unknown;
}

const supportedDesignTokenTypes = new Map<string, "color" | "number">([
  ["color", "color"],
  ["colour", "color"],
  ["number", "number"],
  ["dimension", "number"]
]);

const typographyProperties = new Map<string, "FontSize" | "LineHeight" | "FontWeight">([
  ["fontsize", "FontSize"],
  ["font-size", "FontSize"],
  ["font size", "FontSize"],
  ["lineheight", "LineHeight"],
  ["line-height", "LineHeight"],
  ["line height", "LineHeight"],
  ["fontweight", "FontWeight"],
  ["font-weight", "FontWeight"],
  ["font weight", "FontWeight"]
]);

const fontWeightValues = new Map<string, number>([
  ["thin", 100],
  ["extra light", 200],
  ["extralight", 200],
  ["light", 300],
  ["regular", 400],
  ["normal", 400],
  ["medium", 500],
  ["semi bold", 600],
  ["semibold", 600],
  ["demi bold", 600],
  ["demibold", 600],
  ["bold", 700],
  ["extra bold", 800],
  ["extrabold", 800],
  ["black", 900]
]);

export async function importRawTokenDirectory(
  inputDirectory: string,
  config: RawTokenImportConfig
): Promise<RawTokenImportResult> {
  const inputRoot = resolve(inputDirectory);
  const documents = await Promise.all(
    config.files.map(async (rule) => {
      const absolutePath = resolveInside(inputRoot, rule.source, "input file");
      const text = await readFile(absolutePath, "utf8");
      const parsed = parseJsonText(text, `raw token file ${rule.source}`);

      return {
        source: toPosix(rule.source),
        target: toPosix(rule.target),
        stripPathPrefix: rule.stripPathPrefix,
        value: parsed
      } satisfies RawTokenImportDocument;
    })
  );

  return importRawTokenDocuments(documents, config);
}

export async function writeRawTokenImportOutput(
  inputDirectory: string,
  outputDirectory: string,
  config: RawTokenImportConfig
): Promise<RawTokenImportReport> {
  const result = await importRawTokenDirectory(inputDirectory, config);
  const outputRoot = resolve(outputDirectory);

  for (const [relativePath, value] of result.normalisedFiles) {
    const outputPath = resolveInside(outputRoot, relativePath, "output file");
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, stableJson(value), "utf8");
  }

  const reportPath = resolveInside(outputRoot, "import-report.json", "output report");
  await writeFile(reportPath, stableJson(result.report), "utf8");
  return result.report;
}

export function importRawTokenDocuments(
  documents: readonly RawTokenImportDocument[],
  config: RawTokenImportConfig
): RawTokenImportResult {
  const report = createReport(documents);
  const stripKeys = new Set(
    [...defaultMetadataKeysToStrip, ...(config.metadataKeysToStrip ?? [])].map((key) =>
      key.toLowerCase()
    )
  );

  const sanitisedDocuments = documents.map((document, index) => {
    const rule = config.files[index] ?? {
      source: document.source,
      target: document.target,
      stripPathPrefix: document.stripPathPrefix
    };
    const fileReport = report.files[index];
    const sanitisedValue = stripMetadataAndRejectUnsafeMarkers(
      document.value,
      document,
      [],
      stripKeys,
      fileReport
    );

    return {
      ...document,
      source: toPosix(document.source),
      target: toPosix(document.target),
      stripPathPrefix: document.stripPathPrefix ?? rule.stripPathPrefix,
      index,
      rule,
      value: sanitisedValue
    } satisfies SanitisedRawDocument;
  });

  const context: ImportContext = {
    config: {
      unsupportedTokenPolicy: config.unsupportedTokenPolicy ?? "fail"
    },
    documents: sanitisedDocuments,
    fileReports: report.files,
    rawNodesByPath: indexRawNodes(sanitisedDocuments)
  };

  const records: SourceTokenRecord[] = [];
  for (const document of sanitisedDocuments) {
    visitRawNode(document.value, document, [], context, records);
  }

  const sortedRecords = sortRecords(records);
  const normalisedFiles = recordsToNormalisedFiles(sortedRecords, sanitisedDocuments);
  const finalReport = finaliseReport(report);

  return {
    records: sortedRecords,
    report: finalReport,
    normalisedFiles
  };
}

function stripMetadataAndRejectUnsafeMarkers(
  value: unknown,
  document: RawTokenImportDocument,
  path: readonly string[],
  stripKeys: ReadonlySet<string>,
  fileReport: MutableFileReport | undefined
): unknown {
  if (typeof value === "string") {
    assertNoForbiddenMarker(value, document, path, "value");
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry, index) =>
      stripMetadataAndRejectUnsafeMarkers(
        entry,
        document,
        [...path, String(index)],
        stripKeys,
        fileReport
      )
    );
  }

  if (!isObject(value)) {
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(value)) {
    if (stripKeys.has(key.toLowerCase())) {
      if (fileReport !== undefined) {
        fileReport.metadataKeysStripped += 1;
      }
      continue;
    }

    assertNoForbiddenMarker(key, document, [...path, key], "key");
    result[key] = stripMetadataAndRejectUnsafeMarkers(
      child,
      document,
      [...path, key],
      stripKeys,
      fileReport
    );
  }

  return result;
}

function visitRawNode(
  value: unknown,
  document: SanitisedRawDocument,
  rawPath: readonly string[],
  context: ImportContext,
  records: SourceTokenRecord[]
): void {
  const typographyParts = normaliseTypographyGroup(value, document, rawPath, context);
  if (typographyParts !== undefined) {
    for (const [property, partValue] of typographyParts) {
      emitRecord(document, [...rawPath, property], "number", partValue, context, records);
    }
    return;
  }

  const explicitTokenObject = isDesignTokenObject(value);
  const token = normaliseRawTokenValue(value, document, rawPath, context, new Set());
  if (token !== undefined) {
    emitRecord(document, rawPath, token.type, token.value, context, records);
    return;
  }

  if (explicitTokenObject) {
    return;
  }

  if (isObject(value)) {
    for (const [key, child] of Object.entries(value).sort(([left], [right]) =>
      left.localeCompare(right)
    )) {
      visitRawNode(child, document, [...rawPath, key], context, records);
    }
    return;
  }

  if (value !== null && value !== undefined) {
    addWarning(context, document, rawPath, `Skipped unsupported raw value ${typeof value}`);
  }
}

function normaliseRawTokenValue(
  value: unknown,
  document: SanitisedRawDocument,
  rawPath: readonly string[],
  context: ImportContext,
  seenReferences: ReadonlySet<string>
): RawTokenValue | undefined {
  if (isDesignTokenObject(value)) {
    const explicitType =
      getCaseInsensitiveString(value, "$type") ?? getCaseInsensitiveString(value, "type");
    const designType =
      explicitType === undefined
        ? undefined
        : supportedDesignTokenTypes.get(explicitType.toLowerCase());
    if (designType === undefined) {
      return handleUnsupportedToken(
        context,
        document,
        rawPath,
        `Unsupported design token type ${explicitType ?? "unknown"}`
      );
    }

    return normaliseTypedRawValue(
      getCaseInsensitiveValue(value, "$value") ?? getCaseInsensitiveValue(value, "value"),
      designType,
      document,
      rawPath,
      context,
      seenReferences
    );
  }

  const objectValue = value;
  if (isColorObject(objectValue)) {
    return { type: "color", value: normaliseColorObject(objectValue) };
  }

  if (isObject(objectValue) && hasOwnCaseInsensitive(objectValue, "value")) {
    return normaliseRawTokenValue(
      getCaseInsensitiveValue(objectValue, "value"),
      document,
      rawPath,
      context,
      seenReferences
    );
  }

  const hint = inferTokenHint(document.target, rawPath);
  if (typeof value === "string") {
    const trimmed = value.trim();
    const referencePath = parseReferencePath(trimmed);
    if (referencePath !== undefined) {
      const referenced = resolveReference(
        referencePath,
        document,
        rawPath,
        context,
        seenReferences
      );
      if (referenced === undefined) {
        return undefined;
      }
      return referenced;
    }

    if (/^#[0-9a-fA-F]{6}$/u.test(trimmed)) {
      return { type: "color", value: trimmed };
    }

    const numericValue = parseFiniteNumber(trimmed);
    if (numericValue !== undefined) {
      return { type: "number", value: numericValue };
    }

    const fontWeight = fontWeightValues.get(trimmed.toLowerCase());
    if (fontWeight !== undefined) {
      return { type: "number", value: fontWeight };
    }

    if (hint !== "unknown") {
      return handleUnsupportedToken(context, document, rawPath, `Unsupported ${hint} token value`);
    }

    addWarning(context, document, rawPath, "Skipped unsupported string value");
    return undefined;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return { type: "number", value };
  }

  if (Array.isArray(value) && isNumericTuple(value) && hint === "color") {
    return { type: "color", value: { components: value.map((entry) => Number(entry)) } };
  }

  return undefined;
}

function normaliseTypedRawValue(
  value: unknown,
  expectedType: "color" | "number",
  document: SanitisedRawDocument,
  rawPath: readonly string[],
  context: ImportContext,
  seenReferences: ReadonlySet<string>
): RawTokenValue | undefined {
  const normalised = normaliseRawTokenValue(value, document, rawPath, context, seenReferences);
  if (normalised === undefined) {
    return handleUnsupportedToken(
      context,
      document,
      rawPath,
      `Unsupported ${expectedType} token value`
    );
  }

  if (normalised.type !== expectedType) {
    return handleUnsupportedToken(
      context,
      document,
      rawPath,
      `Expected ${expectedType} token value but found ${normalised.type}`
    );
  }

  return normalised;
}

function normaliseTypographyGroup(
  value: unknown,
  document: SanitisedRawDocument,
  rawPath: readonly string[],
  context: ImportContext
): ReadonlyArray<readonly ["FontSize" | "LineHeight" | "FontWeight", number]> | undefined {
  if (!isObject(value) || !isTypographyTarget(document.target)) {
    return undefined;
  }

  const parts: Array<readonly ["FontSize" | "LineHeight" | "FontWeight", number]> = [];
  for (const [key, child] of Object.entries(value)) {
    const property = typographyProperties.get(key.toLowerCase());
    if (property === undefined) {
      continue;
    }

    const normalised = normaliseRawTokenValue(
      child,
      document,
      [...rawPath, key],
      context,
      new Set()
    );
    if (normalised === undefined) {
      return handleTypographyFailure(
        context,
        document,
        [...rawPath, key],
        "Unsupported typography value"
      );
    }
    if (normalised.type !== "number") {
      return handleTypographyFailure(
        context,
        document,
        [...rawPath, key],
        "Typography value must be numeric"
      );
    }

    parts.push([property, normalised.value as number]);
  }

  return parts.length === 0 ? undefined : parts;
}

function handleTypographyFailure(
  context: ImportContext,
  document: SanitisedRawDocument,
  rawPath: readonly string[],
  message: string
): undefined {
  handleUnsupportedToken(context, document, rawPath, message);
  return undefined;
}

function resolveReference(
  referencePath: readonly string[],
  document: SanitisedRawDocument,
  rawPath: readonly string[],
  context: ImportContext,
  seenReferences: ReadonlySet<string>
): RawTokenValue | undefined {
  const referenced = findReferencedNode(referencePath, document, context);
  if (referenced === undefined) {
    return handleUnsupportedToken(
      context,
      document,
      rawPath,
      `Unresolved raw token reference ${referencePath.join("/")}`
    );
  }

  const referenceKey = `${referenced.document.index}:${referenced.path.join("/")}`;
  if (seenReferences.has(referenceKey)) {
    return handleUnsupportedToken(
      context,
      document,
      rawPath,
      `Circular raw token reference ${referencePath.join("/")}`
    );
  }

  context.fileReports[document.index].aliasesResolved += 1;
  return normaliseRawTokenValue(
    referenced.value,
    referenced.document,
    referenced.path,
    context,
    new Set([...seenReferences, referenceKey])
  );
}

function findReferencedNode(
  referencePath: readonly string[],
  document: SanitisedRawDocument,
  context: ImportContext
): IndexedRawNode | undefined {
  const candidates: IndexedRawNode[] = [];

  addCandidates(candidates, context, referencePath, document.index);
  if (candidates.length > 0) {
    return singleCandidate(referencePath, candidates);
  }

  if (document.stripPathPrefix !== undefined) {
    addCandidates(
      candidates,
      context,
      [...document.stripPathPrefix, ...referencePath],
      document.index
    );
    if (candidates.length > 0) {
      return singleCandidate(referencePath, candidates);
    }
  }

  addCandidates(candidates, context, referencePath);
  if (candidates.length > 0) {
    return singleCandidate(referencePath, candidates);
  }

  for (const candidateDocument of context.documents) {
    if (candidateDocument.stripPathPrefix !== undefined) {
      addCandidates(candidates, context, [...candidateDocument.stripPathPrefix, ...referencePath]);
    }
  }
  if (candidates.length > 0) {
    return singleCandidate(referencePath, candidates);
  }

  const suffixCandidates = [...context.rawNodesByPath.values()]
    .flat()
    .filter((candidate) => pathEndsWith(candidate.path, referencePath));
  return suffixCandidates.length === 0
    ? undefined
    : singleCandidate(referencePath, suffixCandidates);
}

function addCandidates(
  candidates: IndexedRawNode[],
  context: ImportContext,
  path: readonly string[],
  documentIndex?: number
): void {
  const matches = context.rawNodesByPath.get(lookupKey(path)) ?? [];
  for (const match of matches) {
    if (documentIndex === undefined || match.document.index === documentIndex) {
      candidates.push(match);
    }
  }
}

function singleCandidate(
  referencePath: readonly string[],
  candidates: readonly IndexedRawNode[]
): IndexedRawNode {
  const unique = new Map(
    candidates.map((candidate) => [
      `${candidate.document.index}:${candidate.path.join("/")}`,
      candidate
    ])
  );
  if (unique.size > 1) {
    throw new Error(`Ambiguous raw token reference ${referencePath.join("/")}`);
  }

  return [...unique.values()][0];
}

function emitRecord(
  document: SanitisedRawDocument,
  rawPath: readonly string[],
  type: SourceTokenRecord["type"],
  value: unknown,
  context: ImportContext,
  records: SourceTokenRecord[]
): void {
  const sourcePath = stripPathPrefix(rawPath, document.stripPathPrefix);
  if (sourcePath.length === 0) {
    throw new Error(`Raw token in ${document.source} resolved to an empty source path`);
  }

  records.push({
    file: document.target,
    sourcePath,
    type,
    value
  });
  context.fileReports[document.index].tokensImported += 1;
  context.fileReports[document.index].recordsEmitted += 1;
}

function recordsToNormalisedFiles(
  records: readonly SourceTokenRecord[],
  documents: readonly SanitisedRawDocument[]
): ReadonlyMap<string, unknown> {
  const files = new Map<string, unknown>();
  for (const document of documents) {
    files.set(document.target, {});
  }

  for (const record of records) {
    const root = files.get(record.file);
    if (!isObject(root)) {
      throw new Error(`Cannot write normalised token file ${record.file}`);
    }

    let cursor = root;
    for (const segment of record.sourcePath.slice(0, -1)) {
      const existing = cursor[segment];
      if (!isObject(existing)) {
        cursor[segment] = {};
      }
      cursor = cursor[segment] as Record<string, unknown>;
    }

    cursor[record.sourcePath[record.sourcePath.length - 1]] = {
      $type: record.type,
      $value: record.value
    };
  }

  return files;
}

function indexRawNodes(
  documents: readonly SanitisedRawDocument[]
): ReadonlyMap<string, readonly IndexedRawNode[]> {
  const nodes = new Map<string, IndexedRawNode[]>();
  for (const document of documents) {
    indexRawNode(document.value, document, [], nodes);
  }
  return nodes;
}

function indexRawNode(
  value: unknown,
  document: SanitisedRawDocument,
  path: readonly string[],
  nodes: Map<string, IndexedRawNode[]>
): void {
  const key = lookupKey(path);
  const existing = nodes.get(key) ?? [];
  existing.push({ document, path, value });
  nodes.set(key, existing);

  if (!isObject(value)) {
    return;
  }

  for (const [childKey, child] of Object.entries(value)) {
    indexRawNode(child, document, [...path, childKey], nodes);
  }
}

function handleUnsupportedToken(
  context: ImportContext,
  document: SanitisedRawDocument,
  rawPath: readonly string[],
  message: string
): undefined {
  if (context.config.unsupportedTokenPolicy === "warn") {
    addWarning(context, document, rawPath, message);
    return undefined;
  }

  throw new Error(`${document.source}:${rawPath.join(".")}: ${message}`);
}

function addWarning(
  context: ImportContext,
  document: SanitisedRawDocument,
  rawPath: readonly string[],
  message: string
): void {
  const finding: RawTokenImportFinding = {
    file: document.source,
    path: rawPath.join("."),
    message
  };
  context.fileReports[document.index].tokensSkipped += 1;
  context.fileReports[document.index].warnings.push(finding);
}

function createReport(documents: readonly RawTokenImportDocument[]): MutableReport {
  return {
    filesRead: documents.length,
    tokensImported: 0,
    tokensSkipped: 0,
    recordsEmitted: 0,
    metadataKeysStripped: 0,
    aliasesResolved: 0,
    warnings: [],
    files: documents.map((document) => ({
      source: toPosix(document.source),
      target: toPosix(document.target),
      tokensImported: 0,
      tokensSkipped: 0,
      recordsEmitted: 0,
      metadataKeysStripped: 0,
      aliasesResolved: 0,
      warnings: []
    }))
  };
}

function finaliseReport(report: MutableReport): RawTokenImportReport {
  const files = report.files.map((file) => ({
    ...file,
    warnings: [...file.warnings]
  }));

  const warnings = files.flatMap((file) => file.warnings);
  return {
    filesRead: report.filesRead,
    tokensImported: files.reduce((total, file) => total + file.tokensImported, 0),
    tokensSkipped: files.reduce((total, file) => total + file.tokensSkipped, 0),
    recordsEmitted: files.reduce((total, file) => total + file.recordsEmitted, 0),
    metadataKeysStripped: files.reduce((total, file) => total + file.metadataKeysStripped, 0),
    aliasesResolved: files.reduce((total, file) => total + file.aliasesResolved, 0),
    warnings,
    files
  };
}

function isDesignTokenObject(value: unknown): value is Record<string, unknown> {
  return (
    isObject(value) &&
    (hasOwnCaseInsensitive(value, "$value") ||
      hasOwnCaseInsensitive(value, "$type") ||
      (hasOwnCaseInsensitive(value, "value") && hasOwnCaseInsensitive(value, "type")))
  );
}

function isColorObject(value: unknown): value is Record<string, unknown> {
  return (
    isObject(value) &&
    (typeof getCaseInsensitiveValue(value, "hex") === "string" ||
      Array.isArray(getCaseInsensitiveValue(value, "components")))
  );
}

function normaliseColorObject(value: Record<string, unknown>): Record<string, unknown> {
  const normalised: Record<string, unknown> = {};
  const hex = getCaseInsensitiveValue(value, "hex");
  const alpha = getCaseInsensitiveValue(value, "alpha");
  const components = getCaseInsensitiveValue(value, "components");

  if (typeof hex === "string") {
    normalised.hex = hex;
  }

  if (typeof alpha === "number" && Number.isFinite(alpha)) {
    normalised.alpha = alpha;
  }

  if (Array.isArray(components) && isNumericTuple(components)) {
    normalised.components = components.map((entry) => Number(entry));
  }

  return normalised;
}

function inferTokenHint(
  target: string,
  rawPath: readonly string[]
): "color" | "number" | "unknown" {
  if (
    target.startsWith("primitives/") ||
    target.startsWith("semantics/") ||
    target.startsWith("tokens/")
  ) {
    return "color";
  }

  if (target.startsWith("components/")) {
    return target.toLowerCase().includes("dimension") ? "number" : "color";
  }

  if (isSpaceTarget(target) || isRadiusTarget(target)) {
    return "number";
  }

  if (isTypographyTarget(target)) {
    const leaf = rawPath[rawPath.length - 1]?.toLowerCase();
    return leaf !== undefined && typographyProperties.has(leaf) ? "number" : "unknown";
  }

  return "unknown";
}

function isSpaceTarget(target: string): boolean {
  return target === "space.tokens.json" || target.startsWith("spacing/");
}

function isRadiusTarget(target: string): boolean {
  return target === "radius.tokens.json" || target.startsWith("corners/");
}

function isTypographyTarget(target: string): boolean {
  return target === "typography.tokens.json" || target.startsWith("typography/");
}

function getCaseInsensitiveString(value: Record<string, unknown>, key: string): string | undefined {
  const candidate = getCaseInsensitiveValue(value, key);
  return typeof candidate === "string" ? candidate : undefined;
}

function getCaseInsensitiveValue(value: Record<string, unknown>, key: string): unknown {
  const requested = key.toLowerCase();
  for (const [entryKey, entryValue] of Object.entries(value)) {
    if (entryKey.toLowerCase() === requested) {
      return entryValue;
    }
  }
  return undefined;
}

function hasOwnCaseInsensitive(value: Record<string, unknown>, key: string): boolean {
  const requested = key.toLowerCase();
  return Object.keys(value).some((entryKey) => entryKey.toLowerCase() === requested);
}

function parseReferencePath(value: string): readonly string[] | undefined {
  const braceReference = /^\{(.+)\}$/u.exec(value);
  const reference = braceReference?.[1] ?? (value.includes("/") ? value : undefined);
  if (reference === undefined) {
    return undefined;
  }

  return reference
    .split(reference.includes("/") ? "/" : ".")
    .map((segment) => segment.trim())
    .filter(Boolean);
}

function parseFiniteNumber(value: string): number | undefined {
  if (!/^-?\d+(?:\.\d+)?$/u.test(value)) {
    return undefined;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : undefined;
}

function isNumericTuple(value: readonly unknown[]): boolean {
  return (
    value.length >= 3 &&
    value.slice(0, 3).every((entry) => {
      const numberValue =
        typeof entry === "number" ? entry : typeof entry === "string" ? Number(entry) : NaN;
      return Number.isFinite(numberValue);
    })
  );
}

function stripPathPrefix(
  rawPath: readonly string[],
  prefix: readonly string[] | undefined
): readonly string[] {
  if (prefix === undefined || prefix.length === 0) {
    return rawPath;
  }

  const hasPrefix = prefix.every((segment, index) => rawPath[index] === segment);
  return hasPrefix ? rawPath.slice(prefix.length) : rawPath;
}

function sortRecords(records: readonly SourceTokenRecord[]): SourceTokenRecord[] {
  return [...records].sort((left, right) => {
    const fileOrder = left.file.localeCompare(right.file);
    if (fileOrder !== 0) {
      return fileOrder;
    }
    return left.sourcePath.join(".").localeCompare(right.sourcePath.join("."));
  });
}

function lookupKey(path: readonly string[]): string {
  return path.map((segment) => segment.toLowerCase()).join("/");
}

function pathEndsWith(path: readonly string[], suffix: readonly string[]): boolean {
  if (suffix.length > path.length) {
    return false;
  }

  return suffix.every((segment, index) => {
    const pathIndex = path.length - suffix.length + index;
    return path[pathIndex].toLowerCase() === segment.toLowerCase();
  });
}

function assertNoForbiddenMarker(
  value: string,
  document: RawTokenImportDocument,
  path: readonly string[],
  label: "key" | "value"
): void {
  const marker = defaultForbiddenMarkers.find((candidate) => value.includes(candidate));
  if (marker !== undefined) {
    throw new Error(`${document.source}:${path.join(".")}: forbidden marker ${marker} in ${label}`);
  }
}

function resolveInside(root: string, relativePath: string, label: string): string {
  const target = resolve(root, relativePath);
  const targetRelative = relative(root, target);
  if (targetRelative.startsWith("..") || isAbsolute(targetRelative)) {
    throw new Error(`Raw token ${label} must stay inside ${root}: ${relativePath}`);
  }

  return target;
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function toPosix(filePath: string): string {
  return filePath.split(sep).join("/");
}
