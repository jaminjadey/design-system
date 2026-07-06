# Sanitised design-token fixtures

These files are synthetic fixtures for testing a design-token build pipeline outside a private work environment.

The structure, token categories, token types, light/dark theme split, spacing, corner, and typography files are preserved closely enough for pipeline development. Source-specific metadata and traceable values have been removed or replaced.

Sanitisation applied:

- Removed all `$extensions` blocks and design-tool IDs.
- Replaced source colour values with synthetic fixture palettes.
- Renamed brand-specific typography labels to generic display labels.
- Renamed payment-logo and some domain-specific icon labels to generic terms.
- Normalised selected spacing, corner, shadow, and display typography values.

These tokens are for development/testing only and should not be treated as production design guidance.
