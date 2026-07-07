# 02 - Token Source And Demo Fixtures

## Token Source

The demo token source lives in:

```txt
packages/tokens/fixtures/extracted/
  primitives/Default.tokens.json
  tokens/Light.tokens.json
  tokens/Dark.tokens.json
  spacing/Mode 1.tokens.json
  corners/Mode 1.tokens.json
  typography/Default.tokens.json
  manifest.json
  README.md
```

These files are synthetic demo data shaped like common token exports from design
tools. They exist so the pipeline can demonstrate parsing, validation,
canonical mapping, mode merging, and downstream package generation.

## Fixture Coverage

| Area | Purpose |
| --- | --- |
| Primitive colours | Palette values used to derive Mantine colour arrays and CSS variables. |
| Light semantic tokens | Mode-specific semantic colours for light UI. |
| Dark semantic tokens | Mode-specific semantic colours for dark UI. |
| Spacing | Numeric scale mapped to dimension tokens. |
| Corners | Numeric radius scale mapped to radius tokens. |
| Typography | Font size, line height, and weight groups. |

## Source Scan

The source scan is a quality gate before generation. It rejects metadata and
markers that should not be part of the public token contract, including:

- `$extensions`
- `com.figma`
- `VariableID`
- `VariableCollectionId`
- `targetVariable`
- `PRIVATE_COMPANY_NAME_PLACEHOLDER`

The scanner checks raw text and parsed JSON keys so accidental source-tool
metadata fails early.

Run it from the repo root:

```sh
pnpm tokens:scan
```

Expected output:

```txt
Fixture safety scan passed
Files scanned: 8
Forbidden markers found: 0
```

## Updating Demo Tokens

When changing token fixtures:

1. Edit files under `packages/tokens/fixtures/extracted`.
2. Run `pnpm tokens:scan`.
3. Run `pnpm --filter @demo-ds/tokens build`.
4. Run `pnpm --filter @demo-ds/tokens test`.
5. Review generated changes under `packages/tokens/dist`.

The generated token package should be deterministic. Re-running generation with
the same source files should not produce a diff.
