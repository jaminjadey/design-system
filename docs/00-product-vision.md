# 00 - Product vision

## Purpose

The repo should showcase a complete, modern design-system pipeline that starts with sanitised token exports and ends with consumable UI packages and a demo application.

The goal is to demonstrate engineering capability, not to reproduce a private brand. The repo should feel realistic enough to prove the pipeline, but generic enough to be safely public.

## What the demo should prove

1. A token export can be ingested from a source-tool-like shape.
2. Source-specific noise and metadata can be rejected or ignored.
3. The repo can produce a stable canonical token contract.
4. Multiple outputs can be generated from the canonical contract.
5. Mantine can be themed from generated tokens.
6. React components can consume the Mantine theme and semantic CSS variables.
7. Storybook can document the tokens, theme, and components.
8. An example app can consume the design-system packages the same way another application would.
9. Tests can give confidence that the pipeline is not brittle.

## Demo narrative

The demo narrative should be:

> We start with sanitised design-token fixtures. The pipeline validates and normalises them into a canonical design-token model. From that single contract, we generate CSS variables, TypeScript token exports, a Mantine theme package, Storybook documentation, and a React component package. The example app consumes the published-style packages rather than importing implementation internals.

## Intended audience

The repo should make sense to:

- Design-system engineers.
- Front-end engineers.
- Engineering managers.
- Designers who understand token workflows.
- People reviewing how agent-assisted development can accelerate a design-system build.

## Non-goals

The repo should not:

- Recreate a private production design system.
- Include private brand values, logos, fonts, screenshots, or product copy.
- Depend on private registries or internal systems.
- Optimise for every possible platform output in the first version.
- Create a huge component library before the token pipeline is proven.

## Suggested MVP scope

The first complete demo should include:

- Sanitised token fixtures.
- Safety scan.
- Canonical token JSON.
- CSS variables for light and dark modes.
- TypeScript token exports.
- Mantine theme package.
- A small React component package.
- Storybook docs for tokens, theme, and components.
- A Vite React example app.
- CI checks for build, tests, lint, typecheck, and safety scan.

## Later enhancements

After the MVP is working, consider:

- Visual regression testing.
- Design-token diff reports.
- Token documentation generated directly from canonical JSON.
- Figma-style alias support in fixtures.
- Additional platform outputs, such as Android XML or iOS Swift.
- Component recipes and application templates.
- Package publishing to npm under a demo scope.
