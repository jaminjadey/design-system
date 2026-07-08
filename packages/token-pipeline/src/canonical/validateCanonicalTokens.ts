import { defaultForbiddenMarkers } from "../safety/forbiddenMarkers.js";
import type { CanonicalToken, CanonicalTokenDocument } from "./types.js";

const hexPattern = /^#[0-9A-F]{6}([0-9A-F]{2})?$/u;

export const canonicalTokenJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["$schema", "meta", "modes", "tokens"],
  additionalProperties: false
} as const;

export function validateCanonicalTokenDocument(document: CanonicalTokenDocument): void {
  validateTopLevelSchema(document);
  const tokens = collectCanonicalTokens(document);
  const tokenNames = new Set<string>();
  const cssVariables = new Set<string>();
  const serialized = JSON.stringify(document);

  for (const marker of defaultForbiddenMarkers) {
    if (serialized.includes(marker)) {
      throw new Error(`Canonical output contains forbidden marker: ${marker}`);
    }
  }

  for (const token of tokens) {
    if (tokenNames.has(token.name)) {
      throw new Error(`Duplicate canonical token name: ${token.name}`);
    }
    tokenNames.add(token.name);

    if (token.cssVariable !== undefined) {
      if (cssVariables.has(token.cssVariable)) {
        throw new Error(`Duplicate canonical CSS variable: ${token.cssVariable}`);
      }
      cssVariables.add(token.cssVariable);
    }

    validateToken(token);
  }
}

function validateTopLevelSchema(document: CanonicalTokenDocument): void {
  for (const requiredKey of canonicalTokenJsonSchema.required) {
    if (!(requiredKey in document)) {
      throw new Error(`Canonical document is missing required key: ${requiredKey}`);
    }
  }

  if (canonicalTokenJsonSchema.additionalProperties === false) {
    const allowedKeys = new Set<string>(canonicalTokenJsonSchema.required);
    for (const key of Object.keys(document)) {
      if (!allowedKeys.has(key)) {
        throw new Error(`Canonical document contains unsupported top-level key: ${key}`);
      }
    }
  }
}

export function collectCanonicalTokens(document: CanonicalTokenDocument): CanonicalToken[] {
  const tokens: CanonicalToken[] = [];
  visit(document.tokens, tokens);
  return tokens.sort((left, right) => left.name.localeCompare(right.name));
}

function visit(value: unknown, tokens: CanonicalToken[]): void {
  if (!isObject(value)) {
    return;
  }

  if (typeof value.name === "string" && typeof value.type === "string" && Array.isArray(value.path)) {
    tokens.push(value as unknown as CanonicalToken);
    return;
  }

  for (const child of Object.values(value)) {
    visit(child, tokens);
  }
}

function validateToken(token: CanonicalToken): void {
  if (token.name !== token.path.join(".")) {
    throw new Error(`Canonical token name does not match path: ${token.name}`);
  }

  if (token.type === "color") {
    if (typeof token.value === "string") {
      validateHex(token.value, token.name);
      return;
    }

    if (!isObject(token.value) || Object.keys(token.value).sort().join(",") !== "dark,light") {
      throw new Error(`Mode-aware colour ${token.name} must contain exactly light and dark values`);
    }
    validateHex(token.value.light, token.name);
    validateHex(token.value.dark, token.name);
    return;
  }

  if (token.type === "dimension" || token.type === "radius") {
    if (typeof token.value !== "number" || token.value < 0) {
      throw new Error(`Dimension token ${token.name} must contain a positive or zero number`);
    }
    if (token.unit !== "px") {
      throw new Error(`Dimension token ${token.name} must use px unit`);
    }
    return;
  }

  if (token.type === "typography") {
    const value = token.value;
    if (
      typeof value.fontSize !== "number" ||
      typeof value.lineHeight !== "number" ||
      typeof value.fontWeight !== "number"
    ) {
      throw new Error(`Typography token ${token.name} is malformed`);
    }
    return;
  }

  if (token.type === "shadow") {
    const value = token.value;
    if (!isObject(value) || Object.keys(value).sort().join(",") !== "dark,light") {
      throw new Error(`Mode-aware shadow ${token.name} must contain exactly light and dark values`);
    }
    validateShadowValue(token.name, "light", value.light);
    validateShadowValue(token.name, "dark", value.dark);
  }
}

function validateShadowValue(name: string, mode: "light" | "dark", value: unknown): void {
  if (!isObject(value)) {
    throw new Error(`Shadow token ${name} ${mode} value is malformed`);
  }

  for (const property of ["x", "y", "blur", "spread"] as const) {
    if (typeof value[property] !== "number" || !Number.isFinite(value[property])) {
      throw new Error(`Shadow token ${name} ${mode}.${property} must be a finite number`);
    }
  }

  validateHex(value.color, name);
  if (typeof value.opacity !== "number" || value.opacity < 0 || value.opacity > 1) {
    throw new Error(`Shadow token ${name} ${mode}.opacity must be between 0 and 1`);
  }
}

function validateHex(value: unknown, name: string): void {
  if (typeof value !== "string" || !hexPattern.test(value)) {
    throw new Error(`Colour token ${name} must contain uppercase hex`);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
