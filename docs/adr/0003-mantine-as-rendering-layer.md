# ADR 0003 - Mantine is the rendering and theming layer

## Status

Accepted

## Context

The demo needs to show a realistic route from design tokens to production UI. Mantine provides React components, theming, colour scheme support, and CSS variables.

## Decision

The repo will generate a Mantine theme package from canonical tokens and build demo React components on top of Mantine.

## Consequences

Positive:

- Faster route to a polished demo.
- Good Storybook and example app integration.
- Less need to build low-level primitives from scratch.
- Clear theme-provider integration point.

Negative:

- Some token concepts will not map perfectly to Mantine theme keys.
- Semantic tokens need CSS variables in addition to the Mantine theme object.
- The component package should avoid becoming a thin re-export of Mantine.

## Follow-up

- Keep Mantine mapping in `@demo-ds/mantine-theme`.
- Keep canonical tokens independent from Mantine.
- Document which tokens map to Mantine and which remain design-system CSS variables.
