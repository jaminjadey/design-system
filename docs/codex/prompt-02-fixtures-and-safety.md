# Codex prompt 02 - Fixtures and safety scan

```txt
You are working in this repository. Follow AGENTS.md.

Read these files before editing:
- docs/02-token-source-and-demo-fixtures.md
- docs/10-tests-and-quality-gates.md
- docs/14-security-public-demo-rules.md

Task:
Add the demo fixture handling and source scanner.

Assume the demo fixture files will live at:
packages/tokens/fixtures/extracted/

Implement in @demo-ds/token-pipeline:
- A fixture file discovery utility.
- A JSON/text safety scanner.
- Forbidden marker configuration.
- A CLI command or package script for fixture scanning.
- Unit tests for scanner pass and fail cases.

Also add:
- packages/tokens/fixtures/README.md explaining that fixtures are synthetic.
- root script pnpm tokens:scan.

The scanner must fail on:
- $extensions
- com.figma
- VariableID
- VariableCollectionId
- targetVariable
- PRIVATE_COMPANY_NAME_PLACEHOLDER

Use a narrow allowlist only if needed for docs, not for source or fixtures.

Do not add raw private token files. If fixture files are missing, create a clear placeholder README and tests using synthetic inline fixtures.

Acceptance criteria:
- pnpm tokens:scan works.
- Scanner tests pass.
- Scanner reports useful file/path findings.
- Demo fixtures pass when present.
- A synthetic unsafe fixture fails in tests.

Run:
- pnpm --filter @demo-ds/token-pipeline test
- pnpm tokens:scan
- pnpm test

Report the results.
```
