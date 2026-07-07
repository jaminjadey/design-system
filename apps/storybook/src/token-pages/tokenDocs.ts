import tokenDocsJson from "@demo-ds/tokens/token-docs.json";

export interface TokenDoc {
  readonly name: string;
  readonly type: "color" | "dimension" | "radius" | "typography";
  readonly cssVariable?: string;
  readonly value:
    | string
    | number
    | {
        readonly light?: string;
        readonly dark?: string;
        readonly fontSize?: number;
        readonly lineHeight?: number;
        readonly fontWeight?: number;
      };
  readonly unit?: string;
}

export interface TokenDocGroup {
  readonly name: string;
  readonly tokens: readonly TokenDoc[];
}

export interface TokenDocsData {
  readonly meta: {
    readonly generatedBy: string;
    readonly doNotEdit: boolean;
    readonly source: string;
  };
  readonly groups: readonly TokenDocGroup[];
}

export const tokenDocs = tokenDocsJson as TokenDocsData;

export function groupsStartingWith(prefix: string): TokenDocGroup[] {
  return tokenDocs.groups.filter((group) => group.name.startsWith(prefix));
}

export function tokenValueText(token: TokenDoc): string {
  if (typeof token.value === "string" || typeof token.value === "number") {
    return `${token.value}${token.unit ?? ""}`;
  }

  if ("light" in token.value || "dark" in token.value) {
    return `light ${token.value.light ?? "-"} / dark ${token.value.dark ?? "-"}`;
  }

  return [
    `${token.value.fontSize ?? "-"}px`,
    `${token.value.lineHeight ?? "-"}px`,
    `${token.value.fontWeight ?? "-"}`
  ].join(" / ");
}
