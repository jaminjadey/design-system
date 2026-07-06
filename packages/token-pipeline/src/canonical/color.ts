export interface SourceColorValue {
  readonly hex?: unknown;
  readonly alpha?: unknown;
  readonly components?: unknown;
}

export function normaliseColorValue(value: unknown): string {
  if (typeof value === "string") {
    return normaliseHex(value);
  }

  if (!isObject(value)) {
    throw new Error("Colour value must be a string or object");
  }

  const source = value as SourceColorValue;
  if (typeof source.hex === "string") {
    const hex = normaliseHex(source.hex);
    const alpha = typeof source.alpha === "number" ? source.alpha : 1;
    if (alpha === 1) {
      return hex;
    }

    return `${hex}${toAlphaHex(alpha)}`;
  }

  if (Array.isArray(source.components)) {
    const [red, green, blue] = source.components;
    if (typeof red === "number" && typeof green === "number" && typeof blue === "number") {
      return `#${toRgbHex(red)}${toRgbHex(green)}${toRgbHex(blue)}`;
    }
  }

  throw new Error("Colour value must include hex or srgb components");
}

function normaliseHex(hex: string): string {
  const trimmed = hex.trim();
  if (!/^#[0-9a-fA-F]{6}$/u.test(trimmed)) {
    throw new Error(`Invalid hex colour: ${hex}`);
  }
  return trimmed.toUpperCase();
}

function toRgbHex(channel: number): string {
  return Math.round(clamp(channel, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
}

function toAlphaHex(alpha: number): string {
  return Math.round(clamp(alpha, 0, 1) * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
