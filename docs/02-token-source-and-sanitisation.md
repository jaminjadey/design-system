# 02 - Token source and sanitisation

## Allowed source

The only token source that should be copied into the external repo is the sanitised fixture bundle that was generated for this purpose.

Expected fixture contents:

```txt
sanitised-design-token-fixtures/
  primitives/Default.tokens.json
  tokens/Light.tokens.json
  tokens/Dark.tokens.json
  spacing/Mode 1.tokens.json
  corners/Mode 1.tokens.json
  typography/Default.tokens.json
  manifest.json
  README.md
```

The fixture covers:

| Area | Purpose |
| --- | --- |
| Primitive colours | Synthetic palette values. |
| Light semantic tokens | Synthetic semantic colours for light mode. |
| Dark semantic tokens | Synthetic semantic colours for dark mode. |
| Spacing | Synthetic numeric scale. |
| Corners | Synthetic radius scale. |
| Typography | Synthetic type scale and weights. |

## Why sanitisation matters

Raw token exports can contain sensitive or traceable data even if they do not include obvious company names. Risky data can include:

- Exact brand colour values.
- Exact semantic mappings.
- Proprietary typography names.
- Source-tool metadata and variable IDs.
- Internal naming conventions.
- Product-domain labels that reveal implementation details.

The public repo should show the pipeline shape without exposing the original source values.

## Fixture placement

Recommended:

```txt
packages/tokens/fixtures/
  sanitised-design-token-fixtures.zip
  extracted/
    primitives/Default.tokens.json
    tokens/Light.tokens.json
    tokens/Dark.tokens.json
    spacing/Mode 1.tokens.json
    corners/Mode 1.tokens.json
    typography/Default.tokens.json
```

Commit either the zip, the extracted files, or both. For maximum transparency in a public demo, commit the extracted files as readable fixtures and keep the zip only if it helps demonstrate ingestion.

## Required safety scan

Create a script:

```txt
packages/token-pipeline/src/safety/scanFixture.ts
```

It should check at least:

- No `$extensions` keys.
- No `VariableID`.
- No `VariableCollectionId`.
- No `com.figma`.
- No `targetVariable`.
- No private company names.
- No private product names.
- No internal URLs or email domains.
- No proprietary font file names.
- No forbidden image/font binary files.

Example forbidden marker list:

```ts
export const forbiddenMarkers = [
  'PRIVATE_COMPANY_NAME_PLACEHOLDER',
  'com.figma',
  'VariableID',
  'VariableCollectionId',
  'targetVariable',
  '$extensions'
];
```

Keep the list configurable so more terms can be added without changing scanner code.

## Safety scan behaviour

The scan should:

1. Walk fixture files.
2. Read only text-like files.
3. Parse JSON where possible.
4. Search both raw text and parsed object keys.
5. Return structured findings.
6. Fail the build on high-severity findings.
7. Produce a short report for CI logs.

Example CLI:

```sh
pnpm --filter @demo-ds/token-pipeline scan:fixtures
```

Example output:

```txt
Fixture safety scan passed
Files scanned: 6
Forbidden markers found: 0
Unsupported binary files found: 0
```

## Sanitisation provenance

Add a short `packages/tokens/fixtures/README.md` explaining:

- The fixtures are synthetic.
- They are not production design guidance.
- They exist only to test the pipeline.
- They intentionally preserve token categories and structure while replacing sensitive values.
- They should be replaced with real source integration only in a private environment.

## What not to add

Do not add:

- Raw primitive-colour export zip.
- Raw semantic-token export zip.
- Raw spacing export zip.
- Raw radius/corner export zip.
- Raw typography export zip.
- Private font files.
- Private logos.
- Screenshots of internal Figma files.
- Screenshots of private applications.
- Source-tool exports containing IDs or aliases.

## Fixture update process

When updating fixtures:

1. Replace only the sanitised fixture files.
2. Run the safety scan.
3. Run token generation.
4. Review generated diffs.
5. Update snapshot tests deliberately.
6. Document why the fixture changed.

Never update fixtures by copying new raw work files into the external repo.
