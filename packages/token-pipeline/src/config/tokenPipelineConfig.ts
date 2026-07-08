import { readFile } from "node:fs/promises";

import { parseJsonText } from "../json/parseJsonText.js";
import type { TokenMode } from "../mapping/sourceToCanonical.js";
import { parseRawTokenImportConfig, type RawTokenImportConfig } from "../raw/rawTokenImportConfig.js";

export type UnsupportedTokenPolicy = "skip" | "fail";

export interface SemanticColorFileMapping {
  readonly file: string;
  readonly sourceMode: string;
  readonly mode: TokenMode;
}

export interface CanonicalMappingConfig {
  readonly files: {
    readonly primitiveColors: readonly string[];
    readonly semanticColors: readonly SemanticColorFileMapping[];
    readonly spacing: string;
    readonly radius: string;
    readonly typography: string;
  };
  readonly primitiveColors: {
    readonly ignoredPathSegments: readonly string[];
  };
  readonly semanticColors: {
    readonly categoryPrefixes: Readonly<Record<string, readonly string[]>>;
    readonly leafSuffixes: readonly string[];
  };
  readonly spacing: {
    readonly sizePathIndex: number;
  };
  readonly radius: {
    readonly sizePathIndex: number;
    readonly fallbackSizePathIndex: number;
  };
  readonly typography: {
    readonly properties: {
      readonly fontSize: readonly string[];
      readonly lineHeight: readonly string[];
      readonly fontWeight: readonly string[];
    };
    readonly headingPattern: string;
    readonly bodyPrefix: string;
    readonly displayPrefix: string;
  };
  readonly unsupportedTokenPolicy: UnsupportedTokenPolicy;
}

export interface TokenPipelineConfig {
  readonly rawImport?: RawTokenImportConfig;
  readonly canonical: CanonicalMappingConfig;
}

export const defaultCanonicalMappingConfig: CanonicalMappingConfig = {
  files: {
    primitiveColors: ["primitives/Default.tokens.json"],
    semanticColors: [
      {
        file: "tokens/Light.tokens.json",
        sourceMode: "Light",
        mode: "light"
      },
      {
        file: "tokens/Dark.tokens.json",
        sourceMode: "Dark",
        mode: "dark"
      }
    ],
    spacing: "spacing/Mode 1.tokens.json",
    radius: "corners/Mode 1.tokens.json",
    typography: "typography/Default.tokens.json"
  },
  primitiveColors: {
    ignoredPathSegments: ["colour", "colours", "color", "colors"]
  },
  semanticColors: {
    categoryPrefixes: {
      "font-colours": ["text"],
      "background-general-colours": ["background"],
      "border-colours": ["border"],
      "button-colours": ["button"],
      "icon-colour-picker": ["icon"],
      icons: ["icon"],
      "loading-states": ["loading"],
      tooltips: ["tooltip"],
      notifications: ["notification"],
      "form-input-backgrounds": ["form", "background"],
      "date-picker-backgrounds": ["date-picker", "background"],
      navigation: ["navigation"],
      "drop-shadows-cards": ["shadow", "card"],
      lozenge: ["lozenge"],
      marks: ["mark"]
    },
    leafSuffixes: ["text", "background", "border", "colour", "color"]
  },
  spacing: {
    sizePathIndex: 0
  },
  radius: {
    sizePathIndex: 1,
    fallbackSizePathIndex: 0
  },
  typography: {
    properties: {
      fontSize: ["FontSize"],
      lineHeight: ["LineHeight"],
      fontWeight: ["FontWeight"]
    },
    headingPattern: "^h[1-6]$",
    bodyPrefix: "bdy-",
    displayPrefix: "display-"
  },
  unsupportedTokenPolicy: "skip"
};

export const defaultTokenPipelineConfig: TokenPipelineConfig = {
  canonical: defaultCanonicalMappingConfig
};

export async function loadTokenPipelineConfig(filePath: string): Promise<TokenPipelineConfig> {
  const text = await readFile(filePath, "utf8");
  return parseTokenPipelineConfig(parseJsonText(text, filePath));
}

export function parseTokenPipelineConfig(value: unknown): TokenPipelineConfig {
  if (!isObject(value)) {
    throw new Error("Token pipeline config must be an object");
  }

  return {
    rawImport: value.rawImport === undefined ? undefined : parseRawTokenImportConfig(value.rawImport),
    canonical:
      value.canonical === undefined
        ? defaultCanonicalMappingConfig
        : parseCanonicalMappingConfig(value.canonical)
  };
}

function parseCanonicalMappingConfig(value: unknown): CanonicalMappingConfig {
  if (!isObject(value)) {
    throw new Error("canonical config must be an object");
  }

  const files = requiredObject(value.files, "canonical.files");
  const primitiveColors = requiredObject(value.primitiveColors, "canonical.primitiveColors");
  const semanticColors = requiredObject(value.semanticColors, "canonical.semanticColors");
  const spacing = requiredObject(value.spacing, "canonical.spacing");
  const radius = requiredObject(value.radius, "canonical.radius");
  const typography = requiredObject(value.typography, "canonical.typography");

  if (value.unsupportedTokenPolicy !== "skip" && value.unsupportedTokenPolicy !== "fail") {
    throw new Error("canonical.unsupportedTokenPolicy must be skip or fail");
  }

  return {
    files: {
      primitiveColors: parseStringArray(files.primitiveColors, "canonical.files.primitiveColors"),
      semanticColors: parseSemanticColorFiles(files.semanticColors),
      spacing: requiredString(files.spacing, "canonical.files.spacing"),
      radius: requiredString(files.radius, "canonical.files.radius"),
      typography: requiredString(files.typography, "canonical.files.typography")
    },
    primitiveColors: {
      ignoredPathSegments: parseStringArray(
        primitiveColors.ignoredPathSegments,
        "canonical.primitiveColors.ignoredPathSegments"
      )
    },
    semanticColors: {
      categoryPrefixes: parseStringRecordArray(
        semanticColors.categoryPrefixes,
        "canonical.semanticColors.categoryPrefixes"
      ),
      leafSuffixes: parseStringArray(
        semanticColors.leafSuffixes,
        "canonical.semanticColors.leafSuffixes"
      )
    },
    spacing: {
      sizePathIndex: requiredNumber(spacing.sizePathIndex, "canonical.spacing.sizePathIndex")
    },
    radius: {
      sizePathIndex: requiredNumber(radius.sizePathIndex, "canonical.radius.sizePathIndex"),
      fallbackSizePathIndex: requiredNumber(
        radius.fallbackSizePathIndex,
        "canonical.radius.fallbackSizePathIndex"
      )
    },
    typography: {
      properties: parseTypographyProperties(typography.properties),
      headingPattern: requiredString(typography.headingPattern, "canonical.typography.headingPattern"),
      bodyPrefix: requiredString(typography.bodyPrefix, "canonical.typography.bodyPrefix"),
      displayPrefix: requiredString(typography.displayPrefix, "canonical.typography.displayPrefix")
    },
    unsupportedTokenPolicy: value.unsupportedTokenPolicy
  };
}

function parseSemanticColorFiles(value: unknown): readonly SemanticColorFileMapping[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error("canonical.files.semanticColors must be a non-empty array");
  }

  return value.map((entry, index) => {
    if (!isObject(entry)) {
      throw new Error(`canonical.files.semanticColors[${index}] must be an object`);
    }

    const mode = requiredString(entry.mode, `canonical.files.semanticColors[${index}].mode`);
    if (mode !== "light" && mode !== "dark") {
      throw new Error(`canonical.files.semanticColors[${index}].mode must be light or dark`);
    }

    return {
      file: requiredString(entry.file, `canonical.files.semanticColors[${index}].file`),
      sourceMode: requiredString(entry.sourceMode, `canonical.files.semanticColors[${index}].sourceMode`),
      mode
    };
  });
}

function parseTypographyProperties(value: unknown): CanonicalMappingConfig["typography"]["properties"] {
  const properties = requiredObject(value, "canonical.typography.properties");
  return {
    fontSize: parseStringArray(properties.fontSize, "canonical.typography.properties.fontSize"),
    lineHeight: parseStringArray(properties.lineHeight, "canonical.typography.properties.lineHeight"),
    fontWeight: parseStringArray(properties.fontWeight, "canonical.typography.properties.fontWeight")
  };
}

function parseStringRecordArray(value: unknown, label: string): Readonly<Record<string, readonly string[]>> {
  if (!isObject(value)) {
    throw new Error(`${label} must be an object`);
  }

  const result: Record<string, readonly string[]> = {};
  for (const [key, child] of Object.entries(value)) {
    result[key] = parseStringArray(child, `${label}.${key}`);
  }
  return result;
}

function parseStringArray(value: unknown, label: string): readonly string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
    throw new Error(`${label} must be an array of strings`);
  }
  return value;
}

function requiredObject(value: unknown, label: string): Record<string, unknown> {
  if (!isObject(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a string`);
  }
  return value;
}

function requiredNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
