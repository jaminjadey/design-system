export type RawImportUnsupportedPolicy = "fail" | "warn";

export interface RawTokenImportFileRule {
  readonly source: string;
  readonly target: string;
  readonly stripPathPrefix?: readonly string[];
}

export interface RawTokenImportConfig {
  readonly files: readonly RawTokenImportFileRule[];
  readonly metadataKeysToStrip?: readonly string[];
  readonly unsupportedTokenPolicy?: RawImportUnsupportedPolicy;
}

export const defaultMetadataKeysToStrip: readonly string[] = [
  "$extensions",
  "com.figma",
  "VariableID",
  "VariableCollectionId",
  "targetVariable",
  "hiddenFromPublishing",
  "scopes"
];

export function defineRawTokenImportConfig(config: RawTokenImportConfig): RawTokenImportConfig {
  return config;
}

export function parseRawTokenImportConfig(value: unknown): RawTokenImportConfig {
  if (!isObject(value)) {
    throw new Error("Raw token import config must be an object");
  }

  if (!Array.isArray(value.files) || value.files.length === 0) {
    throw new Error("Raw token import config must include at least one file rule");
  }

  const files = value.files.map((entry, index) => parseFileRule(entry, index));
  const metadataKeysToStrip =
    value.metadataKeysToStrip === undefined
      ? undefined
      : parseStringArray(value.metadataKeysToStrip, "metadataKeysToStrip");

  if (
    value.unsupportedTokenPolicy !== undefined &&
    value.unsupportedTokenPolicy !== "fail" &&
    value.unsupportedTokenPolicy !== "warn"
  ) {
    throw new Error("unsupportedTokenPolicy must be either fail or warn");
  }

  return {
    files,
    metadataKeysToStrip,
    unsupportedTokenPolicy: value.unsupportedTokenPolicy
  };
}

function parseFileRule(value: unknown, index: number): RawTokenImportFileRule {
  if (!isObject(value)) {
    throw new Error(`Raw token file rule ${index + 1} must be an object`);
  }

  if (typeof value.source !== "string" || value.source.trim() === "") {
    throw new Error(`Raw token file rule ${index + 1} is missing source`);
  }

  if (typeof value.target !== "string" || value.target.trim() === "") {
    throw new Error(`Raw token file rule ${index + 1} is missing target`);
  }

  return {
    source: value.source,
    target: value.target,
    stripPathPrefix:
      value.stripPathPrefix === undefined
        ? undefined
        : parseStringArray(value.stripPathPrefix, `files[${index}].stripPathPrefix`)
  };
}

function parseStringArray(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`${label} must be an array of strings`);
  }

  return value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
