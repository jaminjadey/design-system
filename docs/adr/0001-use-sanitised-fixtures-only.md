# ADR 0001 - Use sanitised fixtures only

## Status

Accepted

## Context

The external demo repo needs realistic token data to prove the pipeline. Raw work token exports may contain brand-identifying values, source-tool metadata, proprietary typography names, or internal naming.

## Decision

The repo will use only the sanitised fixture bundle generated for the demo. Raw work exports, private fonts, logos, screenshots, and internal assets will not be copied into the repo.

## Consequences

Positive:

- The repo can be public or developed outside the work machine.
- The token pipeline has realistic structure.
- The risk of exposing private brand data is reduced.

Negative:

- The fixture values are not production design guidance.
- Some production edge cases may not appear until the pipeline is run privately against real exports.

## Follow-up

- Add a fixture safety scan.
- Add a repo-wide forbidden marker scan.
- Keep fixture provenance documented.
