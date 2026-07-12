# 03 - Canonical Token Model

## Purpose

The canonical token model is the stable contract between source-token ingestion
and all generated outputs.

Source exports can change shape. Mantine can change APIs. Storybook can change
configuration. The canonical token model keeps downstream packages independent
from the source-file shape.

## Design Principles

- Canonical tokens are generated from demo source fixtures.
- Canonical tokens use generic, stable, documented names.
- Canonical tokens preserve modes where needed.
- Canonical values are easy to emit to CSS, TypeScript, JSON, and Mantine.
- Canonical schema validation happens before outputs are generated.
- Source-tool metadata is not allowed in canonical output.

## Canonical File

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
    "generatedAt": "1970-01-01T00:00:00.000Z",
    "source": "demo-design-token-fixtures",
    "generator": "@demo-ds/token-pipeline"
  },
  "modes": ["light", "dark"],
  "tokens": {
    "color": {},
    "component": {},
    "space": {},
    "radius": {},
    "shadow": {},
    "typography": {}
  }
}
```

For deterministic snapshots, avoid writing wall-clock timestamps in committed
generated files unless the value is controlled.

## Token Identity

Each token should have:

| Field         | Meaning                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------ |
| `path`        | Array path, for example `['color', 'semantic', 'text', 'default']`.                              |
| `name`        | Dot path, for example `color.semantic.text.default`.                                             |
| `cssVariable` | CSS custom property name, for example `--ds-color-text-default`.                                 |
| `type`        | Canonical type, for example `color`, `component`, `dimension`, `radius`, `shadow`, `typography`. |
| `value`       | Canonical value, or mode map for mode-aware tokens.                                              |
| `source`      | Optional debug provenance pointing to the fixture file and source path.                          |

## Naming Rules

Source labels can contain spaces, capitals, inconsistent wording, or typos.
Canonical names should not.

Rules:

1. Trim whitespace.
2. Replace `&` with `and`.
3. Replace slashes and spaces with `-` inside a segment, or split into path segments where meaningful.
4. Lowercase everything.
5. Remove punctuation that is not useful.
6. Collapse repeated dashes.
7. Keep a mapping table for source path to canonical path.

Examples:

| Source path                       | Canonical path                             |
| --------------------------------- | ------------------------------------------ |
| `Base colours.Black`              | `color.primitive.base.black`               |
| `Primary.10`                      | `color.primitive.primary.10`               |
| `Font colours.Default text`       | `color.semantic.text.default`              |
| `Background general colours.Body` | `color.semantic.background.body`           |
| `Space-2XL`                       | `space.2xl`                                |
| `Corder-radius.Corner-Med`        | `radius.md`                                |
| `Drop shadows - cards.Position Y` | `shadow.card`                              |
| `Button.Primary.High.Background`  | `component.button.primary.high.background` |
| `H1.FontSize`                     | `typography.heading.h1.font-size`          |

The source has a category spelling like `Corder-radius`. Do not preserve that
typo in canonical output. Map it to `radius`.

## Colour Values

Source fixture colour values may be objects with a colour space, numeric
components, alpha, and hex value:

```json
{
  "colorSpace": "srgb",
  "components": [0.9254901961, 0.9960784314, 1.0],
  "alpha": 1,
  "hex": "#ECFEFF"
}
```

Canonical colour values should be normalised to uppercase hex strings where
alpha is `1`:

```json
{
  "type": "color",
  "value": "#ECFEFF"
}
```

## Mode-Aware Semantic Colours

The light and dark semantic token files share the same broad structure but
contain mode-specific values. Canonical output should merge matching semantic
paths:

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

Generated CSS then emits light and dark values under Mantine colour-scheme
selectors.

## Dimensions And Typography

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

Typography source values are grouped into coherent text styles:

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

## Component Tokens

Component tokens live under `component.*`. They are generated from
component-level source variables and are consumed by `@demo-ds/components`
wrappers.

Component colour tokens are mode-aware:

```json
{
  "name": "component.button.primary.high.background",
  "type": "component",
  "valueType": "color",
  "value": {
    "light": "#155E75",
    "dark": "#0E7490"
  },
  "cssVariable": "--ds-component-button-primary-high-background"
}
```

Component dimension tokens are static px values:

```json
{
  "name": "component.button.height.md",
  "type": "component",
  "valueType": "dimension",
  "value": 36,
  "unit": "px",
  "cssVariable": "--ds-component-button-height-md"
}
```

Shadow source values are grouped into coherent elevation tokens. Geometry is
read from numeric parts such as `Position X`, `Position Y`, `Blur`, and
`Spread`; colour and opacity are used when present, otherwise configured
defaults are applied:

```json
{
  "name": "shadow.card",
  "type": "shadow",
  "value": {
    "light": {
      "x": 0,
      "y": 2,
      "blur": 8,
      "spread": 0,
      "color": "#0F172A",
      "opacity": 0.12
    },
    "dark": {
      "x": 0,
      "y": 2,
      "blur": 8,
      "spread": 0,
      "color": "#0F172A",
      "opacity": 0.12
    }
  },
  "cssVariable": "--ds-shadow-card"
}
```

## Validation

Validate:

- Required top-level keys.
- Allowed token types.
- Valid hex colours.
- Positive or zero numeric scales.
- Matching mode keys for mode-aware semantic tokens.
- Complete shadow geometry for each mode.
- Complete light/dark values for component colour tokens.
- Unique canonical token names.
- Unique CSS variable names.
- No source-tool metadata keys.

## Generated Versus Source Tokens

Do not hand-edit `canonical.json`. Instead:

1. Edit source fixtures or mapping rules.
2. Regenerate canonical output.
3. Review the diff.
4. Update tests deliberately.

Generated files should include a header or metadata indicating how they were
created.
