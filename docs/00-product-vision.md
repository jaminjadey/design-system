# 00 - Product Vision

## Purpose

This repo showcases a complete design-system pipeline that starts with
Figma-style design-token JSON and ends with consumable UI packages and a demo
application.

The goal is to demonstrate the engineering workflow: token ingestion,
canonical modelling, generated package outputs, Mantine theming, wrapped React
components, Storybook documentation, and an app consuming the same public
exports.

## What The Demo Proves

1. A token export can be ingested from a design-tool-like shape.
2. Source-tool metadata can be rejected or ignored before generation.
3. The repo can produce a stable canonical token contract.
4. CSS, TypeScript, JSON, and documentation data can be generated from one contract.
5. Mantine can be themed from generated tokens.
6. React components can consume the Mantine theme and semantic CSS variables.
7. Storybook can document the tokens, theme, and components.
8. An example app can consume the packages the same way another app would.
9. Tests and CI can protect the pipeline from drift.

## Demo Narrative

> We start with demo design-token JSON shaped like a Figma token export. The
> pipeline validates and normalises it into a canonical token model. From that
> single contract, we generate CSS variables, TypeScript token exports,
> documentation data, a Mantine theme package, and a React component package.
> Storybook and the example app consume those packages through public exports.

## Intended Audience

- Design-system engineers.
- Front-end engineers.
- Engineering managers.
- Designers familiar with token workflows.
- People reviewing how agent-assisted development can accelerate a design-system build.

## Non-Goals

The repo should not:

- Recreate a complete production design system.
- Include brand-specific values, logos, fonts, screenshots, or product copy.
- Depend on private registries or internal systems.
- Optimise for every possible platform output in the first version.
- Wrap every Mantine component when a package export or usage pattern is enough.

## MVP Scope

The complete demo includes:

- Demo token fixtures.
- Token source scan.
- Canonical token JSON.
- CSS variables for light and dark modes.
- TypeScript token exports.
- Mantine theme package.
- A small React component package.
- Storybook docs for tokens, theme, and components.
- A Vite React example app.
- CI checks for scan, lint, typecheck, tests, build, and generated-output drift.

## Later Enhancements

- GitHub Pages Storybook deployment.
- Visual regression testing.
- Design-token diff reports.
- Token documentation generated directly from canonical JSON.
- Figma-style alias support in fixtures.
- Additional platform outputs, such as Android XML or iOS Swift.
- Component recipes and application templates.
- Package publishing under a demo scope.
