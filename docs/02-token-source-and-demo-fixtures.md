# 02 - Token Source And Demo Fixtures

## Token Source

The demo token source lives in:

```txt
packages/tokens/fixtures/extracted/
  primitives/colours.tokens.json
  semantics/light.tokens.json
  semantics/dark.tokens.json
  components/light.tokens.json
  components/dark.tokens.json
  components/dimensions.tokens.json
  space.tokens.json
  radius.tokens.json
  typography.tokens.json
  manifest.json
  README.md
```

These files are synthetic demo data shaped like common token exports from design
tools. They exist so the pipeline can demonstrate parsing, validation,
canonical mapping, mode merging, and downstream package generation.

The token pipeline also includes a raw-import path for local private exports.
Those files belong only in:

```txt
.private/design-system/
```

That directory is ignored by Git, skipped by repo scans, and checked by CI so it
cannot be committed accidentally.

## Fixture Coverage

| Area                  | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| Primitive colours     | Palette values used to derive Mantine colour arrays and CSS variables. |
| Light semantic tokens | Mode-specific semantic colours for light UI.                           |
| Dark semantic tokens  | Mode-specific semantic colours for dark UI.                            |
| Component tokens      | Synthetic component-level values for wrappers and variants.            |
| Spacing               | Numeric scale mapped to dimension tokens.                              |
| Radius                | Numeric corner scale mapped to radius tokens.                          |
| Typography            | Font size, line height, and weight groups.                             |

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
Files scanned: 11
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

## Raw Export Import

The public importer fixture lives in:

```txt
packages/token-pipeline/tests/fixtures/raw-figma-export/
```

It is a synthetic raw export with invented values. It exercises nested colour
objects, slash aliases, brace aliases, light/dark modes, spacing, radius,
typography, component token targets, metadata stripping, unsupported-token
reporting, and deterministic normalised output.

The importer is config-driven. A file rule maps one raw input file to one
normalised token-source output:

```json
{
  "files": [
    {
      "source": "primitive-colours.raw.json",
      "target": "primitives/colours.tokens.json",
      "stripPathPrefix": ["Primitive colours"]
    }
  ]
}
```

Run a local private import with:

```sh
pnpm tokens:import -- --input .private/design-system --output .private/normalised-token-output --config .private/design-system/import.config.json
```

The output directory contains normalised token JSON plus `import-report.json`.
Keep that output under `.private/` when it contains real brand values. In a
private work repo, the same command can target the token source directory used
by the build.

Canonical source-to-token mapping rules live in `token-pipeline.config.json`.
The token package build writes `build-report.json` so reviewers can see source
record counts, skipped records, path renames, missing modes, generated files,
and warnings.

Component source files are mapped separately from broad semantic colour files.
That lets a private work repo point configured component categories at either
dedicated component export files or the same light/dark mode files used for
semantic colours.
