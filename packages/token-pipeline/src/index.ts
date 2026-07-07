export {
  buildCanonicalTokens,
  buildCanonicalTokensFromRecords,
  readSourceTokenRecords,
  type BuildOptions
} from "./canonical/buildCanonicalTokens.js";
export { generateTokenOutputs, type OutputOptions } from "./canonical/generateTokenOutputs.js";
export { normaliseColorValue } from "./canonical/color.js";
export {
  canonicalTokenJsonSchema,
  collectCanonicalTokens,
  validateCanonicalTokenDocument
} from "./canonical/validateCanonicalTokens.js";
export type {
  CanonicalColorToken,
  CanonicalDimensionToken,
  CanonicalToken,
  CanonicalTokenBase,
  CanonicalTokenDocument,
  CanonicalTokenSource,
  CanonicalTypographyToken,
  CanonicalTypographyValue,
  ModeValue,
  TokenMode,
  TokenType
} from "./canonical/types.js";

export {
  discoverFixtureFiles,
  textFixtureExtensions,
  type DiscoveredFixtureFile
} from "./fixtures/discoverFixtureFiles.js";
export {
  cssVariableName,
  normaliseNameSegment,
  normaliseSizeName,
  normaliseTokenPath,
  tokenName
} from "./mapping/nameNormalisation.js";
export { sourcePathToCanonicalPath, type SourceMapping } from "./mapping/sourceToCanonical.js";
export {
  importRawTokenDirectory,
  importRawTokenDocuments,
  writeRawTokenImportOutput,
  type RawTokenImportDocument,
  type RawTokenImportFileReport,
  type RawTokenImportFinding,
  type RawTokenImportReport,
  type RawTokenImportResult
} from "./raw/importRawTokens.js";
export {
  defaultMetadataKeysToStrip,
  defineRawTokenImportConfig,
  parseRawTokenImportConfig,
  type RawImportUnsupportedPolicy,
  type RawTokenImportConfig,
  type RawTokenImportFileRule
} from "./raw/rawTokenImportConfig.js";
export {
  defaultForbiddenMarkers,
  type ForbiddenMarker
} from "./safety/forbiddenMarkers.js";
export {
  formatSafetyFinding,
  scanFixtureDirectory,
  scanFixtureText,
  type SafetyFinding,
  type SafetyScanResult
} from "./safety/scanFixture.js";
export {
  flattenSourceTokens,
  parseSourceTokenFile,
  type SourceTokenRecord
} from "./source/sourceRecords.js";
