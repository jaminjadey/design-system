export type TokenMode = "light" | "dark";

export type TokenType = "color" | "dimension" | "radius" | "typography";

export interface CanonicalTokenSource {
  readonly file: string;
  readonly path: string;
}

export interface CanonicalTokenBase<TValue> {
  readonly name: string;
  readonly path: readonly string[];
  readonly type: TokenType;
  readonly value: TValue;
  readonly cssVariable?: string;
  readonly source?: CanonicalTokenSource;
}

export type ModeValue<T> = T | Record<TokenMode, T>;

export interface CanonicalColorToken extends CanonicalTokenBase<ModeValue<string>> {
  readonly type: "color";
}

export interface CanonicalDimensionToken extends CanonicalTokenBase<number> {
  readonly type: "dimension" | "radius";
  readonly unit: "px";
}

export interface CanonicalTypographyValue {
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: number;
}

export interface CanonicalTypographyToken
  extends CanonicalTokenBase<CanonicalTypographyValue> {
  readonly type: "typography";
}

export type CanonicalToken =
  | CanonicalColorToken
  | CanonicalDimensionToken
  | CanonicalTypographyToken;

export interface CanonicalTokenDocument {
  readonly $schema: string;
  readonly meta: {
    readonly name: "demo-design-system-tokens";
    readonly version: "0.1.0";
    readonly generatedAt: "1970-01-01T00:00:00.000Z";
    readonly source: "sanitised-design-token-fixtures";
    readonly generator: "@demo-ds/token-pipeline";
  };
  readonly modes: readonly TokenMode[];
  readonly tokens: {
    readonly color: {
      readonly primitive: Record<string, unknown>;
      readonly semantic: Record<string, unknown>;
    };
    readonly space: Record<string, unknown>;
    readonly radius: Record<string, unknown>;
    readonly typography: Record<string, unknown>;
  };
}
