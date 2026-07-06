import type { SourceTokenRecord } from "../source/sourceRecords.js";
import { normaliseNameSegment, normaliseSizeName } from "./nameNormalisation.js";

export type TokenMode = "light" | "dark";

export interface SourceMapping {
  readonly canonicalPath: readonly string[];
  readonly category: "primitive-color" | "semantic-color" | "space" | "radius" | "typography-part";
  readonly mode?: TokenMode;
  readonly typographyProperty?: "fontSize" | "lineHeight" | "fontWeight";
}

export function sourcePathToCanonicalPath(record: SourceTokenRecord): SourceMapping | undefined {
  if (record.file === "primitives/Default.tokens.json") {
    if (record.type !== "color") {
      return undefined;
    }

    return {
      category: "primitive-color",
      canonicalPath: ["color", "primitive", ...normaliseSourcePath(record.sourcePath)]
    };
  }

  if (record.file === "tokens/Light.tokens.json" || record.file === "tokens/Dark.tokens.json") {
    if (record.type !== "color") {
      return undefined;
    }

    return {
      category: "semantic-color",
      canonicalPath: ["color", "semantic", ...mapSemanticPath(record.sourcePath)],
      mode: record.file.includes("Light") ? "light" : "dark"
    };
  }

  if (record.file === "spacing/Mode 1.tokens.json") {
    return {
      category: "space",
      canonicalPath: ["space", normaliseSizeName(record.sourcePath[0] ?? "")]
    };
  }

  if (record.file === "corners/Mode 1.tokens.json") {
    return {
      category: "radius",
      canonicalPath: ["radius", normaliseSizeName(record.sourcePath[1] ?? record.sourcePath[0] ?? "")]
    };
  }

  if (record.file === "typography/Default.tokens.json") {
    const property = mapTypographyProperty(record.sourcePath[1]);
    if (property === undefined) {
      return undefined;
    }

    return {
      category: "typography-part",
      canonicalPath: ["typography", ...mapTypographyStyle(record.sourcePath[0] ?? "")],
      typographyProperty: property
    };
  }

  return undefined;
}

function normaliseSourcePath(sourcePath: readonly string[]): string[] {
  return sourcePath
    .flatMap((segment) => normaliseNameSegment(segment).split("-"))
    .filter((segment) => segment !== "colour" && segment !== "colours" && segment !== "color");
}

function mapSemanticPath(sourcePath: readonly string[]): string[] {
  const [category = "misc", leaf = "token"] = sourcePath;
  const categorySlug = normaliseNameSegment(category);
  const leafSlug = normaliseNameSegment(leaf);
  const prefix = semanticCategoryPrefixes[categorySlug] ?? [categorySlug.replace(/-colours$/u, "")];
  const leafParts = trimSemanticLeaf(leafSlug, prefix[0]);
  return [...prefix, ...leafParts];
}

const semanticCategoryPrefixes: Record<string, string[]> = {
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
};

function trimSemanticLeaf(leafSlug: string, prefix: string): string[] {
  const trimmed = leafSlug
    .replace(new RegExp(`-${prefix}$`, "u"), "")
    .replace(/-text$/u, "")
    .replace(/-background$/u, "")
    .replace(/-border$/u, "")
    .replace(/-colour$/u, "")
    .replace(/-color$/u, "");

  return trimmed.split("-").filter(Boolean);
}

function mapTypographyProperty(sourceProperty: string | undefined):
  | "fontSize"
  | "lineHeight"
  | "fontWeight"
  | undefined {
  switch (sourceProperty) {
    case "FontSize":
      return "fontSize";
    case "LineHeight":
      return "lineHeight";
    case "FontWeight":
      return "fontWeight";
    default:
      return undefined;
  }
}

function mapTypographyStyle(sourceStyle: string): string[] {
  const slug = normaliseNameSegment(sourceStyle);

  if (/^h[1-6]$/u.test(slug)) {
    return ["heading", slug];
  }

  if (slug.startsWith("bdy-")) {
    return ["body", ...slug.replace(/^bdy-/u, "").split("-")];
  }

  if (slug.startsWith("display-")) {
    return ["display", ...slug.replace(/^display-/u, "").split("-")];
  }

  return slug.split("-");
}
