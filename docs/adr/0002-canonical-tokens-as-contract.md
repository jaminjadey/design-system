# ADR 0002 - Canonical tokens are the internal contract

## Status

Accepted

## Context

Source token exports can contain source-tool-specific structures. Downstream outputs need stable inputs. If every output generator reads raw source files, the pipeline will become brittle and hard to test.

## Decision

The repo will transform demo source fixtures into a canonical token document. All outputs will be generated from that canonical document.

## Consequences

Positive:

- One stable contract for CSS, TypeScript, Mantine, and docs output.
- Easier testing.
- Source-tool noise is isolated.
- Future source integrations can target the same canonical model.

Negative:

- Requires an explicit transformer.
- Requires maintaining schema and mapping rules.

## Follow-up

- Define canonical TypeScript types.
- Add canonical JSON schema or Zod schema.
- Snapshot canonical output.
- Document token naming rules.
