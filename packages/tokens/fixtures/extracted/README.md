# Demo design-token fixtures

These files are synthetic token fixtures for the demo design-system pipeline.

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
```

They intentionally use generic categories and values while preserving the kind
of structure a token export may contain: primitive palettes, light/dark semantic
tokens, component-level values, spacing, radius, and typography scales.

The `components/` files are also synthetic. They demonstrate how component
variables from a design tool can flow into canonical `component.*` tokens and
then into the React wrapper package as `--ds-component-*` CSS variables.

The fixtures are development inputs, not production design guidance. Change
them only when you want to demonstrate a token-source change, then run the
scanner and regenerate the token package.

Real raw exports and real imported output must stay under `.private/` in this
public repo. Do not use this directory for private brand values.
