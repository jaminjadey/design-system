export type TokenMode = "light" | "dark";

export type TokenType = "color" | "component" | "dimension" | "radius" | "shadow" | "typography";

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

export interface CanonicalTypographyToken extends CanonicalTokenBase<CanonicalTypographyValue> {
  readonly type: "typography";
}

export interface CanonicalShadowValue {
  readonly x: number;
  readonly y: number;
  readonly blur: number;
  readonly spread: number;
  readonly color: string;
  readonly opacity: number;
}

export interface CanonicalShadowToken extends CanonicalTokenBase<ModeValue<CanonicalShadowValue>> {
  readonly type: "shadow";
}

export type CanonicalComponentValueType = "color" | "dimension";

export interface CanonicalComponentToken extends CanonicalTokenBase<ModeValue<string> | number> {
  readonly type: "component";
  readonly valueType: CanonicalComponentValueType;
  readonly unit?: "px";
}

export type CanonicalToken =
  | CanonicalColorToken
  | CanonicalComponentToken
  | CanonicalDimensionToken
  | CanonicalShadowToken
  | CanonicalTypographyToken;

export interface CanonicalTokenDocument {
  readonly $schema: string;
  readonly meta: {
    readonly name: "demo-design-system-tokens";
    readonly version: "0.1.0";
    readonly generatedAt: "1970-01-01T00:00:00.000Z";
    readonly source: "demo-design-token-fixtures";
    readonly generator: "@demo-ds/token-pipeline";
  };
  readonly modes: readonly TokenMode[];
  readonly tokens: {
    readonly component: Record<string, unknown>;
    readonly color: {
      readonly primitive: Record<string, unknown>;
      readonly semantic: Record<string, unknown>;
    };
    readonly space: Record<string, unknown>;
    readonly radius: Record<string, unknown>;
    readonly shadow: Record<string, unknown>;
    readonly typography: Record<string, unknown>;
  };
}
