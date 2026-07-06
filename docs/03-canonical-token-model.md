# 03 - Canonical token model

## Purpose

The canonical token model is the stable contract between source-token ingestion and all generated outputs.

Source exports can change shape. Mantine can change APIs. Storybook can change configuration. The canonical token model should be the repo's internal source of truth after ingestion.

## Design principles

- Canonical tokens are generated from sanitised source fixtures.
- Canonical tokens use generic, stable, documented names.
- Canonical tokens preserve modes where needed.
- Canonical values are easy to emit to CSS, TypeScript, JSON, and Mantine.
- Canonical schema validation happens before outputs are generated.
- Source-specific metadata is not allowed in canonical output.

## Canonical file

Recommended output:

```txt
packages/tokens/dist/canonical.json
```

Recommended structure:

```json
{
  "$schema": "https://example.local/schemas/canonical-tokens.schema.json",
  "meta": {
    "name": "demo-design-system-tokens",
    "version": "0.1.0",
    "generatedAt": "2026-07-06T00:00:00.000Z",
    "source": "sanitised-design-token-fixtures",
    "generator": "@demo-ds/token-pipeline"
  },
  "modes": ["light", "dark"],
  "tokens": {
    "color": {},
    "space": {},
    "radius": {},
    "typography": {}
  }
}
```

For deterministic snapshots, avoid writing wall-clock `generatedAt` in committed generated fixtures unless it is controlled by an environment variable or excluded from snapshots.

## Token identity

Each token should have:

| Field | Meaning |
| --- | --- |
| `path` | Array path, for example `['color', 'semantic', 'text', 'default']`. |
| `name` | Dot path, for example `color.semantic.text.default`. |
| `cssVariable` | CSS custom property name, for example `--ds-color-text-default`. |
| `type` | Canonical type, for example `color`, `dimension`, `number`, `typography`. |
| `value` | Canonical value, or mode map for mode-aware tokens. |
| `source` | Optional debug provenance pointing to sanitised fixture file and source path. |

## Naming rules

Source labels can contain spaces, capitals, inconsistent wording, or typos. Canonical names should not.

Rules:

1. Trim whitespace.
2. Replace `&` with `and`.
3. Replace slashes and spaces with `-` inside a segment, or split into path segments where meaningful.
4. Lowercase everything.
5. Remove punctuation that is not useful.
6. Collapse repeated dashes.
7. Keep a mapping table for source path to canonical path.

Examples:

| Source path | Canonical path |
| --- | --- |
| `Base colours.Black` | `color.primitive.base.black` |
| `Primary.10` | `color.primitive.primary.10` |
| `Font colours.Default text` | `color.semantic.text.default` |
| `Background general colours.Page background` | `color.semantic.background.page` |
| `Space-2XL` | `space.2xl` |
| `Corder-radius.Corner-Med` | `radius.md` |
| `H1.FontSize` | `typography.heading.h1.font-size` |

The source has a category spelling like `Corder-radius`. Do not preserve that typo in canonical output. Map it to `radius`.

## Colour values

Source fixture colour values are objects like:

```json
{
  "colorSpace": "srgb",
  "components": [0.9254901961, 0.9960784314, 1.0],
  "alpha": 1,
  "hex": "#ECFEFF"
}
```

Canonical colour values should be normalised to uppercase hex strings where alpha is `1`:

```json
{
  "type": "color",
  "value": "#ECFEFF"
}
```

If alpha is not `1`, prefer an `rgba()` or 8-digit hex strategy and test it. Pick one format and apply it consistently.

## Mode-aware semantic colours

The light and dark semantic token files share the same broad structure but contain mode-specific values. Canonical output should merge matching semantic paths:

```json
{
  "name": "color.semantic.text.default",
  "type": "color",
  "value": {
    "light": "#083344",
    "dark": "#FDFDFD"
  },
  "cssVariable": "--ds-color-text-default"
}
```

Generated CSS should then emit light and dark values under different selectors.

## Dimensions and numbers

Keep numeric source values as numbers in canonical JSON:

```json
{
  "name": "space.md",
  "type": "dimension",
  "value": 8,
  "unit": "px",
  "cssVariable": "--ds-space-md"
}
```

Emit `8px` only in CSS output. This keeps TypeScript consumers able to use numbers where needed.

## Typography

Typography source values are groups with `FontSize`, `LineHeight`, and `FontWeight`. Canonical output should group them as coherent text styles:

```json
{
  "name": "typography.heading.h1",
  "type": "typography",
  "value": {
    "fontSize": 32,
    "lineHeight": 40,
    "fontWeight": 700
  }
}
```

Use generic font families in generated Mantine output:

```ts
fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
```

Do not include private font names or font files.

## Suggested TypeScript types

```ts
export type TokenMode = 'light' | 'dark';

export type TokenType =
  | 'color'
  | 'dimension'
  | 'number'
  | 'radius'
  | 'typography';

export interface CanonicalTokenBase<TValue> {
  name: string;
  path: string[];
  type: TokenType;
  value: TValue;
  cssVariable?: string;
  description?: string;
  source?: {
    file: string;
    path: string;
  };
}

export type ModeValue<T> = T | Record<TokenMode, T>;

export type CanonicalColorToken = CanonicalTokenBase<ModeValue<string>> & {
  type: 'color';
};

export type CanonicalDimensionToken = CanonicalTokenBase<number> & {
  type: 'dimension' | 'radius';
  unit: 'px';
};

export interface CanonicalTypographyValue {
  fontSize: number;
  lineHeight: number;
  fontWeight: number;
}

export type CanonicalTypographyToken = CanonicalTokenBase<CanonicalTypographyValue> & {
  type: 'typography';
};
```

## Validation

Use a runtime validator such as Zod or JSON Schema. Validate:

- Required top-level keys.
- Allowed token types.
- Valid hex colours.
- Positive or zero numeric scales.
- Matching mode keys for mode-aware semantic tokens.
- Unique canonical token names.
- Unique CSS variable names.
- No forbidden metadata keys.

## Relationship to DTCG-style tokens

The source fixtures already use `$type` and `$value`, which aligns with the direction of modern design-token formats. Still, the demo repo should define its own canonical contract. This avoids coupling downstream packages directly to a source-tool export shape or to a changing external specification.

## Generated versus source canonical tokens

Do not hand-edit `canonical.json`. Instead:

1. Edit source fixtures only when intentionally changing test input.
2. Edit pipeline mapping rules.
3. Regenerate canonical output.
4. Review the diff.
5. Update tests.

Generated files should include a header or adjacent metadata indicating how they were created.
