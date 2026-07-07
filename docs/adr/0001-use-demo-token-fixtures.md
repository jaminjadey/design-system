# ADR 0001 - Use Demo Token Fixtures

## Status

Accepted

## Context

The demo repo needs realistic token data to prove the pipeline. The source files
should be useful enough to exercise parsing, mode merging, theme mapping, and
component usage, while remaining generic demo data.

## Decision

The repo will use synthetic demo token fixtures under
`packages/tokens/fixtures/extracted`. Generated outputs will be derived from
those fixtures through `@demo-ds/token-pipeline`.

## Consequences

Positive:

- The repo can demonstrate the complete pipeline without external services.
- The token pipeline has realistic structure.
- Storybook and the example app can run from a fresh checkout.

Negative:

- The fixture values are not production design guidance.
- Some production edge cases may require additional fixture coverage later.

## Follow-Up

- Keep the token source scan in CI.
- Keep generated outputs deterministic.
- Document fixture changes through normal code review.
