import {
  defaultCanonicalMappingConfig,
  type CanonicalMappingConfig
} from "../config/tokenPipelineConfig.js";
import type { SourceTokenRecord } from "../source/sourceRecords.js";
import { normaliseNameSegment, normaliseSizeName } from "./nameNormalisation.js";

export type TokenMode = "light" | "dark";

export interface SourceMapping {
  readonly canonicalPath: readonly string[];
  readonly category:
    | "primitive-color"
    | "semantic-color"
    | "component-color"
    | "component-dimension"
    | "space"
    | "radius"
    | "shadow-part"
    | "typography-part";
  readonly mode?: TokenMode;
  readonly shadowProperty?: "x" | "y" | "blur" | "spread" | "color" | "opacity";
  readonly typographyProperty?: "fontSize" | "lineHeight" | "fontWeight";
}

export function sourcePathToCanonicalPath(
  record: SourceTokenRecord,
  config: CanonicalMappingConfig = defaultCanonicalMappingConfig
): SourceMapping | undefined {
  if (config.files.primitiveColors.includes(record.file)) {
    if (record.type !== "color") {
      return undefined;
    }

    return {
      category: "primitive-color",
      canonicalPath: ["color", "primitive", ...normaliseSourcePath(record.sourcePath, config)]
    };
  }

  const componentColorFile = config.files.componentColors.find(
    (entry) => entry.file === record.file
  );
  if (componentColorFile !== undefined) {
    const componentColorMapping = mapComponentColor(record, componentColorFile.mode, config);
    if (componentColorMapping !== undefined) {
      return componentColorMapping;
    }
  }

  if (record.file === config.files.componentDimensions) {
    if (record.type !== "number") {
      return undefined;
    }

    return {
      category: "component-dimension",
      canonicalPath: ["component", ...mapComponentDimensionPath(record.sourcePath, config)]
    };
  }

  const semanticFile = config.files.semanticColors.find((entry) => entry.file === record.file);
  if (semanticFile !== undefined) {
    const shadowMapping = mapShadowPart(record, semanticFile.mode, config);
    if (shadowMapping !== undefined) {
      return shadowMapping;
    }

    if (record.type !== "color") {
      return undefined;
    }

    return {
      category: "semantic-color",
      canonicalPath: ["color", "semantic", ...mapSemanticPath(record.sourcePath, config)],
      mode: semanticFile.mode
    };
  }

  if (record.file === config.files.spacing) {
    return {
      category: "space",
      canonicalPath: [
        "space",
        normaliseSizeName(record.sourcePath[config.spacing.sizePathIndex] ?? "")
      ]
    };
  }

  if (record.file === config.files.radius) {
    return {
      category: "radius",
      canonicalPath: [
        "radius",
        normaliseSizeName(
          record.sourcePath[config.radius.sizePathIndex] ??
            record.sourcePath[config.radius.fallbackSizePathIndex] ??
            ""
        )
      ]
    };
  }

  if (record.file === config.files.typography) {
    const property = mapTypographyProperty(record.sourcePath[1], config);
    if (property === undefined) {
      return undefined;
    }

    return {
      category: "typography-part",
      canonicalPath: ["typography", ...mapTypographyStyle(record.sourcePath[0] ?? "", config)],
      typographyProperty: property
    };
  }

  return undefined;
}

function mapComponentColor(
  record: SourceTokenRecord,
  mode: TokenMode,
  config: CanonicalMappingConfig
): SourceMapping | undefined {
  if (record.type !== "color") {
    return undefined;
  }

  const componentPath = mapConfiguredComponentPath(record.sourcePath, config);
  if (componentPath === undefined) {
    return undefined;
  }

  return {
    category: "component-color",
    canonicalPath: ["component", ...componentPath],
    mode
  };
}

function mapComponentDimensionPath(
  sourcePath: readonly string[],
  config: CanonicalMappingConfig
): string[] {
  return mapConfiguredComponentPath(sourcePath, config) ?? normaliseGenericSourcePath(sourcePath);
}

function mapConfiguredComponentPath(
  sourcePath: readonly string[],
  config: CanonicalMappingConfig
): string[] | undefined {
  const [category, ...leafPath] = sourcePath;
  if (category === undefined) {
    return undefined;
  }

  const prefix = config.components.categoryPrefixes[normaliseNameSegment(category)];
  if (prefix === undefined) {
    return undefined;
  }

  const normalisedLeafParts = trimComponentLeafSuffixes(
    normaliseGenericSourcePath(leafPath),
    config
  );
  const prefixedPath = mapComponentLeafPrefix(normalisedLeafParts, config);
  if (prefixedPath !== undefined) {
    return prefixedPath;
  }

  const leafParts = removeLeadingPath(
    normalisedLeafParts,
    prefix.flatMap((segment) => segment.split("-"))
  );
  return [...prefix, ...(leafParts.length === 0 ? ["default"] : leafParts)];
}

function trimComponentLeafSuffixes(
  leafParts: readonly string[],
  config: CanonicalMappingConfig
): string[] {
  let trimmed = [...leafParts];
  for (const suffix of config.components.leafSuffixes) {
    const suffixSlug = normaliseNameSegment(suffix);
    if (trimmed[trimmed.length - 1] === suffixSlug) {
      trimmed = trimmed.slice(0, -1);
    }
  }

  return trimmed;
}

function mapComponentLeafPrefix(
  leafParts: readonly string[],
  config: CanonicalMappingConfig
): string[] | undefined {
  const matches = Object.entries(config.components.leafPrefixes)
    .map(([sourcePrefix, canonicalPrefix]) => ({
      sourceParts: normaliseNameSegment(sourcePrefix).split("-"),
      canonicalPrefix
    }))
    .filter(({ sourceParts }) => startsWithPath(leafParts, sourceParts))
    .sort((left, right) => right.sourceParts.length - left.sourceParts.length);

  const match = matches[0];
  if (match === undefined) {
    return undefined;
  }

  return [...match.canonicalPrefix, ...leafParts.slice(match.sourceParts.length)];
}

function removeLeadingPath(path: readonly string[], prefix: readonly string[]): string[] {
  if (
    prefix.length === 0 ||
    prefix.length > path.length ||
    !prefix.every((segment, index) => path[index] === segment)
  ) {
    return [...path];
  }

  return path.slice(prefix.length);
}

function startsWithPath(path: readonly string[], prefix: readonly string[]): boolean {
  return (
    prefix.length > 0 &&
    prefix.length <= path.length &&
    prefix.every((segment, index) => path[index] === segment)
  );
}

function mapShadowPart(
  record: SourceTokenRecord,
  mode: TokenMode,
  config: CanonicalMappingConfig
): SourceMapping | undefined {
  const [category, property] = record.sourcePath;
  if (category === undefined || property === undefined) {
    return undefined;
  }

  const categoryPath = config.shadows.categoryPaths[normaliseNameSegment(category)];
  if (categoryPath === undefined) {
    return undefined;
  }

  const shadowProperty = mapShadowProperty(property, config);
  if (shadowProperty === undefined) {
    return undefined;
  }

  return {
    category: "shadow-part",
    canonicalPath: ["shadow", ...categoryPath],
    mode,
    shadowProperty
  };
}

function mapShadowProperty(
  sourceProperty: string,
  config: CanonicalMappingConfig
): "x" | "y" | "blur" | "spread" | "color" | "opacity" | undefined {
  const propertySlug = normaliseNameSegment(sourceProperty);

  if (matchesConfiguredName(propertySlug, config.shadows.properties.x)) {
    return "x";
  }
  if (matchesConfiguredName(propertySlug, config.shadows.properties.y)) {
    return "y";
  }
  if (matchesConfiguredName(propertySlug, config.shadows.properties.blur)) {
    return "blur";
  }
  if (matchesConfiguredName(propertySlug, config.shadows.properties.spread)) {
    return "spread";
  }
  if (matchesConfiguredName(propertySlug, config.shadows.properties.color)) {
    return "color";
  }
  if (matchesConfiguredName(propertySlug, config.shadows.properties.opacity)) {
    return "opacity";
  }

  return undefined;
}

function normaliseSourcePath(
  sourcePath: readonly string[],
  config: CanonicalMappingConfig
): string[] {
  const ignoredSegments = new Set(config.primitiveColors.ignoredPathSegments);
  return sourcePath
    .flatMap((segment) => normaliseNameSegment(segment).split("-"))
    .filter((segment) => !ignoredSegments.has(segment));
}

function normaliseGenericSourcePath(sourcePath: readonly string[]): string[] {
  return sourcePath
    .flatMap((segment) => normaliseNameSegment(segment).split("-"))
    .filter((segment) => segment.length > 0);
}

function mapSemanticPath(sourcePath: readonly string[], config: CanonicalMappingConfig): string[] {
  const [category = "misc", leaf = "token"] = sourcePath;
  const categorySlug = normaliseNameSegment(category);
  const leafSlug = normaliseNameSegment(leaf);
  const prefix = config.semanticColors.categoryPrefixes[categorySlug] ?? [
    categorySlug.replace(/-colours$/u, "")
  ];
  const leafParts = trimSemanticLeaf(leafSlug, prefix[0], config);
  return [...prefix, ...leafParts];
}

function trimSemanticLeaf(
  leafSlug: string,
  prefix: string,
  config: CanonicalMappingConfig
): string[] {
  let trimmed = leafSlug.replace(new RegExp(`-${prefix}$`, "u"), "");
  for (const suffix of config.semanticColors.leafSuffixes) {
    trimmed = trimmed.replace(new RegExp(`-${normaliseNameSegment(suffix)}$`, "u"), "");
  }

  return trimmed.split("-").filter(Boolean);
}

function mapTypographyProperty(
  sourceProperty: string | undefined,
  config: CanonicalMappingConfig
): "fontSize" | "lineHeight" | "fontWeight" | undefined {
  if (sourceProperty === undefined) {
    return undefined;
  }

  const propertySlug = normaliseNameSegment(sourceProperty);
  if (matchesConfiguredName(propertySlug, config.typography.properties.fontSize)) {
    return "fontSize";
  }
  if (matchesConfiguredName(propertySlug, config.typography.properties.lineHeight)) {
    return "lineHeight";
  }
  if (matchesConfiguredName(propertySlug, config.typography.properties.fontWeight)) {
    return "fontWeight";
  }

  return undefined;
}

function mapTypographyStyle(sourceStyle: string, config: CanonicalMappingConfig): string[] {
  const slug = normaliseNameSegment(sourceStyle);

  if (new RegExp(config.typography.headingPattern, "u").test(slug)) {
    return ["heading", slug];
  }

  const bodyPrefix = normaliseNameSegment(config.typography.bodyPrefix);
  if (slug.startsWith(`${bodyPrefix}-`)) {
    return [
      "body",
      ...slug.replace(new RegExp(`^${escapeRegExp(bodyPrefix)}-`, "u"), "").split("-")
    ];
  }

  const displayPrefix = normaliseNameSegment(config.typography.displayPrefix);
  if (slug.startsWith(`${displayPrefix}-`)) {
    return [
      "display",
      ...slug.replace(new RegExp(`^${escapeRegExp(displayPrefix)}-`, "u"), "").split("-")
    ];
  }

  return slug.split("-");
}

function matchesConfiguredName(sourceSlug: string, configuredNames: readonly string[]): boolean {
  return configuredNames.some((name) => normaliseNameSegment(name) === sourceSlug);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}
