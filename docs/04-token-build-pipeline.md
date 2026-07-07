# 04 - Token Build Pipeline

## Pipeline Overview

The pipeline turns demo token source files into package artifacts.

```mermaid
flowchart TD
  A[Demo token JSON] --> B[Source scan]
  B --> C[Read and parse]
  C --> D[Source validation]
  D --> E[Normalise names]
  E --> F[Canonical transform]
  F --> G[Canonical validation]
  G --> H[Generate CSS]
  G --> I[Generate TS]
  G --> J[Generate docs data]
  H --> K[Package outputs]
  I --> K
  J --> K
```

## Stage 1: Fixture Discovery

Inputs:

```txt
packages/tokens/fixtures/extracted/primitives/Default.tokens.json
packages/tokens/fixtures/extracted/tokens/Light.tokens.json
packages/tokens/fixtures/extracted/tokens/Dark.tokens.json
packages/tokens/fixtures/extracted/spacing/Mode 1.tokens.json
packages/tokens/fixtures/extracted/corners/Mode 1.tokens.json
packages/tokens/fixtures/extracted/typography/Default.tokens.json
```

Responsibilities:

- Confirm expected files exist.
- Confirm files are JSON.
- Confirm no unsupported binary files were introduced.
- Sort paths for deterministic processing.

## Stage 2: Source Scan

Responsibilities:

- Search for forbidden strings.
- Search for forbidden JSON keys.
- Fail on source-tool metadata.
- Produce a useful CI log.

Command:

```sh
pnpm tokens:scan
```

## Stage 3: Source Parsing

Responsibilities:

- Parse JSON files.
- Convert nested source objects into flat source-token records.
- Keep source path and file information for debugging.

Example source-token record:

```ts
interface SourceTokenRecord {
  file: string;
  sourcePath: string[];
  type: string;
  value: unknown;
}
```

## Stage 4: Source Validation

Responsibilities:

- Ensure each token has `$type` and `$value`.
- Ensure supported source `$type` values are handled.
- Ensure colour values have either `hex` or enough data to derive hex.
- Ensure typography groups have the expected properties.
- Fail clearly on unknown or malformed input.

## Stage 5: Normalisation And Mapping

Responsibilities:

- Convert source paths to canonical paths.
- Apply explicit mapping rules for known source categories.
- Apply generic slugification for leaf names.
- Fix source naming issues, such as `Corder-radius` -> `radius`.

Suggested implementation:

```txt
packages/token-pipeline/src/mapping/sourceToCanonical.ts
packages/token-pipeline/src/mapping/nameNormalisation.ts
```

Keep explicit mapping tables close to tests.

## Stage 6: Canonical Transform

Responsibilities:

- Convert source records into canonical token objects.
- Merge light and dark semantic colour files.
- Convert colour objects to hex strings.
- Convert spacing and radius numbers to dimension tokens with `px` unit.
- Group typography attributes into coherent typography tokens.
- Attach source provenance for debugging.

Output:

```txt
packages/tokens/dist/canonical.json
```

## Stage 7: Canonical Validation

Responsibilities:

- Validate canonical schema.
- Ensure uniqueness of canonical token names.
- Ensure uniqueness of CSS variable names.
- Ensure no source-only metadata exists.
- Ensure all mode-aware tokens contain exactly `light` and `dark` keys.

## Stage 8: Output Generation

Generate:

```txt
packages/tokens/dist/canonical.json
packages/tokens/dist/tokens.css
packages/tokens/dist/tokens.light.css
packages/tokens/dist/tokens.dark.css
packages/tokens/dist/index.js
packages/tokens/dist/index.d.ts
packages/tokens/dist/token-names.js
packages/tokens/dist/token-names.d.ts
packages/tokens/dist/metadata.json
packages/tokens/dist/token-docs.json
```

Do not manually edit generated files.

## Stage 9: Package Build

Build TypeScript packages into distributable output:

```sh
pnpm --filter @demo-ds/token-pipeline build
pnpm --filter @demo-ds/tokens build
pnpm --filter @demo-ds/mantine-theme build
pnpm --filter @demo-ds/components build
```

## Stage 10: Documentation And App Build

Storybook and the example app should consume generated artifacts through package
exports.

```sh
pnpm --filter @demo-ds/storybook build
pnpm --filter @demo-ds/example build
```

## Recommended Scripts

At root:

```json
{
  "scripts": {
    "tokens:scan": "pnpm --filter @demo-ds/token-pipeline scan:fixtures",
    "tokens:build": "pnpm --filter @demo-ds/tokens build",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck"
  }
}
```

## Failure Policy

Fail fast on:

- Missing fixture files.
- Invalid JSON.
- Forbidden markers.
- Unknown token types.
- Duplicate canonical names.
- Invalid colour values.
- Missing light/dark values.
- Generated output drift in CI.

## Output Drift Check

Regenerate outputs and verify the working tree is clean:

```sh
pnpm tokens:build
git diff --exit-code
```

This proves generated artifacts are committed and reproducible.
