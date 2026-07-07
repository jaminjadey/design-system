import { tokens } from "@demo-ds/tokens";

interface TokenLeaf<TValue> {
  readonly value: TValue;
  readonly cssVariable?: string;
}

interface TypographyValue {
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: number;
}

interface ModeColorValue {
  readonly light: string;
  readonly dark: string;
}

const tokenRoot = tokens as {
  readonly color: {
    readonly primitive: Record<string, Record<string, TokenLeaf<string>>>;
    readonly semantic: {
      readonly text: {
        readonly default: TokenLeaf<ModeColorValue>;
      };
      readonly background: {
        readonly body: TokenLeaf<ModeColorValue>;
        readonly card: TokenLeaf<ModeColorValue>;
      };
    };
  };
  readonly space: Record<string, TokenLeaf<number>>;
  readonly radius: Record<string, TokenLeaf<number>>;
  readonly typography: {
    readonly heading: Record<string, TokenLeaf<TypographyValue>>;
  };
};

export function colorValue(path: readonly string[]): string {
  const token = readTokenLeaf<string>(path);
  return token.value;
}

export function dimensionValue(path: readonly string[]): string {
  const token = readTokenLeaf<number>(path);
  return `${token.value}px`;
}

export function typographyValue(path: readonly string[]): TypographyValue {
  return readTokenLeaf<TypographyValue>(path).value;
}

export function modeColorValue(path: readonly string[], mode: "light" | "dark"): string {
  return readTokenLeaf<ModeColorValue>(path).value[mode];
}

export function cssVariable(path: readonly string[]): string {
  const token = readTokenLeaf<unknown>(path);
  if (token.cssVariable === undefined) {
    throw new Error(`Token ${path.join(".")} does not expose a CSS variable`);
  }

  return token.cssVariable;
}

function readTokenLeaf<TValue>(path: readonly string[]): TokenLeaf<TValue> {
  let cursor: unknown = tokenRoot;

  for (const segment of path) {
    if (!isRecord(cursor) || !(segment in cursor)) {
      throw new Error(`Missing generated token: ${path.join(".")}`);
    }

    cursor = cursor[segment];
  }

  if (!isRecord(cursor) || !("value" in cursor)) {
    throw new Error(`Generated token is malformed: ${path.join(".")}`);
  }

  return cursor as unknown as TokenLeaf<TValue>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
