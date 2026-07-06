export function normaliseNameSegment(segment: string): string {
  return segment
    .trim()
    .replace(/&/gu, " and ")
    .replace(/([a-z])([A-Z])/gu, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .replace(/-+/gu, "-")
    .toLowerCase();
}

export function normaliseTokenPath(path: readonly string[]): string[] {
  return path.map(normaliseNameSegment).filter((segment) => segment.length > 0);
}

export function tokenName(path: readonly string[]): string {
  return path.join(".");
}

export function cssVariableName(path: readonly string[]): string {
  const publicPath =
    path[0] === "color" && path[1] === "semantic" ? [path[0], ...path.slice(2)] : path;
  return `--ds-${publicPath.join("-")}`;
}

export function normaliseSizeName(segment: string): string {
  const slug = normaliseNameSegment(segment)
    .replace(/^space-/u, "")
    .replace(/^corner-/u, "")
    .replace(/^x-sml$/u, "xs")
    .replace(/^extra-sml$/u, "xs")
    .replace(/^sml$/u, "sm")
    .replace(/^med$/u, "md")
    .replace(/^lge$/u, "lg");

  return slug.replace(/(\d+)-xl/u, "$1xl");
}
