export {
  buildCanonicalTokens,
  buildCanonicalTokensFromRecordsWithReport,
  buildCanonicalTokensWithReport,
  buildCanonicalTokensFromRecords,
  readSourceTokenRecords,
  withGeneratedFiles,
  type BuildOptions,
  type CanonicalBuildFinding,
  type CanonicalBuildReport,
  type CanonicalPathMappingReport,
  type SemanticModeMissingReport
} from "./canonical/buildCanonicalTokens.js";
export {
  generateTokenOutputs,
  type GeneratedTokenOutputReport,
  type OutputOptions
} from "./canonical/generateTokenOutputs.js";
export { normaliseColorValue } from "./canonical/color.js";
export {
  canonicalTokenJsonSchema,
  collectCanonicalTokens,
  validateCanonicalTokenDocument
} from "./canonical/validateCanonicalTokens.js";
export type {
  CanonicalColorToken,
  CanonicalDimensionToken,
  CanonicalShadowToken,
  CanonicalShadowValue,
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
  defaultCanonicalMappingConfig,
  defaultTokenPipelineConfig,
  loadTokenPipelineConfig,
  parseTokenPipelineConfig,
  type CanonicalMappingConfig,
  type SemanticColorFileMapping,
  type TokenPipelineConfig,
  type UnsupportedTokenPolicy
} from "./config/tokenPipelineConfig.js";

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
export { parseJsonText, stripLeadingByteOrderMark } from "./json/parseJsonText.js";
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
