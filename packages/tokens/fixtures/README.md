# Demo token fixtures

These fixtures are synthetic design-token data for the demo pipeline.

They model common token categories from a Figma-style export: primitive colours,
semantic colours, spacing, radius, and typography. The files are used to test
parsing, token scanning, canonical token generation, and downstream package
builds.

They are not production design guidance. Treat changes to these files like any
source-token change: scan them, regenerate token outputs, and review the diff.

Private raw exports belong in `.private/design-system/`, not in this fixture
directory. Use `pnpm tokens:import:raw` to test raw import locally and keep any
real imported output under `.private/` in this public repo.
