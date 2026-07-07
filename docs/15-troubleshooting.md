# 15 - Troubleshooting

## Fixture scan fails

Possible causes:

- Source files include unsupported metadata or forbidden markers.
- A generated file contains forbidden metadata.
- A docs file mentions a forbidden marker and is not allowlisted.
- A new fixture includes source-tool IDs.

Fix:

1. Read the scan report.
2. Remove the offending file or value.
3. Add a narrow allowlist only if the marker is intentionally documented.
4. Add a regression test.

## Canonical generation fails on unknown token type

Possible causes:

- Fixture structure changed.
- New `$type` is not supported.
- Parser is walking group objects incorrectly.

Fix:

1. Add a failing parser test.
2. Decide whether the new token type should be supported.
3. Implement the mapper.
4. Update canonical schema if needed.

## Light and dark values do not merge

Possible causes:

- Source paths differ between light and dark files.
- Name normalisation is inconsistent.
- One mode has an extra token.

Fix:

1. Log normalised paths for both modes.
2. Add a diff report for mode token names.
3. Fail with a clear message listing missing paths.

## CSS variables missing in components

Possible causes:

- `@demo-ds/tokens/css` is not imported.
- `DemoThemeProvider` is not used.
- CSS selector expects a Mantine colour-scheme attribute that is not present.
- Component uses the wrong variable name.

Fix:

1. Confirm `DemoThemeProvider` is at the root.
2. Confirm generated CSS is imported once.
3. Inspect DOM for `data-mantine-color-scheme`.
4. Check `token-names.ts` for the correct variable.

## Mantine theme does not apply

Possible causes:

- Multiple MantineProvider instances are fighting each other.
- App imported Mantine styles after overriding styles.
- Theme package imports generated values from the wrong path.
- Package build output is stale.

Fix:

1. Ensure `DemoThemeProvider` is used once near the app root.
2. Rebuild `@demo-ds/tokens` and `@demo-ds/mantine-theme`.
3. Confirm package exports resolve to `dist`.
4. Check Storybook and example app both use the same provider.

## Storybook cannot resolve workspace packages

Possible causes:

- Package has not been built.
- `exports` field is wrong.
- Vite/Storybook alias is missing.
- TypeScript path aliases differ from package exports.

Fix:

1. Run `pnpm build` from repo root.
2. Check package `exports` fields.
3. Use workspace dependencies rather than deep relative imports.
4. Add Storybook Vite config aliases only if needed.

## Generated output drift in CI

Possible causes:

- Generated files were not committed.
- Generator output order is nondeterministic.
- Timestamps or absolute paths are included.
- Different Node versions produce different formatting.

Fix:

1. Sort object keys before writing output.
2. Remove timestamps from committed output.
3. Pin formatting rules.
4. Regenerate locally and commit the diff.

## Component tests fail because Mantine context is missing

Possible causes:

- Test renders component without provider.
- Test does not import required CSS in setup.

Fix:

Create a test helper:

```tsx
export function renderWithTheme(ui: React.ReactElement) {
  return render(<DemoThemeProvider>{ui}</DemoThemeProvider>);
}
```

Use it for all component tests that rely on Mantine.

## Example app works but Storybook does not

Possible causes:

- Storybook has a different provider setup.
- Storybook is importing a source file instead of package output.
- Storybook build has stale cache.

Fix:

1. Compare app root provider and Storybook decorator.
2. Clear Storybook cache.
3. Build packages before building Storybook.
4. Keep imports through package exports.

## TypeScript cannot find generated types

Possible causes:

- Tokens package has not built.
- `types` or `exports` fields are wrong.
- Generated `.d.ts` files are not emitted.

Fix:

1. Build `@demo-ds/tokens`.
2. Inspect `packages/tokens/dist`.
3. Check package manifest.
4. Ensure `declaration: true` in TypeScript build config.

## Too much is being generated into Git

Possible causes:

- Build artifacts and caches are not ignored.
- Package dist policy is unclear.

Fix:

Commit only intentional generated contract files. Ignore caches and app build directories:

```txt
node_modules
.turbo
dist-storybook
apps/*/dist
coverage
```

For package `dist`, decide whether the demo commits it. If yes, keep it deterministic.
