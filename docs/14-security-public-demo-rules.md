# 14 - Security and public-demo rules

## Core Rule

The repo must demonstrate the design-system process with generic demo data.

## Forbidden Content

Do not commit:

- Raw work token exports.
- Original source colour values.
- Internal Figma metadata.
- Private fonts.
- Private logos.
- Private icons.
- Internal screenshots.
- Internal project names.
- Client names.
- Employee or customer data.
- Internal URLs.
- Work email domains.
- API keys or environment files.

## Token Source Checks

Design-token source files can accidentally include tool metadata or
environment-specific content. The scanner rejects those markers before
generation.

Treat fixture changes like any source change: scan, build, test, and review the
generated diff.

## Private Raw Export Location

Real brand token exports must only be placed in:

```txt
.private/design-system/
```

The folder is ignored by Git and guarded by `pnpm private:check`, which fails if
anything below `.private/` becomes tracked. Use this path for local import
testing, then write normalised output to another `.private/` directory unless
you are working in a private repo intended to hold those brand values.

Never copy real raw export files or real imported token output into the public
demo fixtures.

## Required Repo Scan

Add a script that scans the whole repo for forbidden terms:

```sh
pnpm repo:scan
```

It should scan:

- Markdown.
- JSON.
- TypeScript.
- CSS.
- Package manifests.
- Generated outputs.
- Fixture files.

It should skip:

- `node_modules`.
- `.git`.
- build caches.
- generated binary artifacts.

## Allowlist Policy

Some docs may mention forbidden marker names as examples. Keep a narrow allowlist for known documentation files if needed.

Prefer wording docs to avoid repeated sensitive names. If the scanner has to allow too much, the docs should be rewritten.

## Secret Scanning

Use GitHub secret scanning where available. Also add local patterns for:

- `.env`
- private keys
- access tokens
- npm tokens
- OpenAI keys
- GitHub tokens

Do not commit `.env` files. Use `.env.example` with fake values only.

## Licensing

Use permissive licensing only for code and docs you created for the demo.

Do not license private source assets. They should not be in the repo at all.

Recommended:

```txt
MIT for code
CC BY 4.0 for docs, if desired
```

A single MIT license for the whole demo repo is simpler, provided all content is yours and synthetic.

## Public Copy Rules

Use generic product copy:

Good:

```txt
Project overview
Service status
Profile settings
Notification preferences
Support request
```

Avoid:

```txt
Real customer journeys
Real financial product names
Internal feature names
Internal channel names
```

## Visual Assets

Use no external brand imagery. For icons, use an open-source icon library with a compatible license.

Do not use private icon exports from the source design system.

## Fonts

Use system fonts or open fonts installed through normal package/CDN workflows.

Do not copy private font files. Do not include private font family names in CSS, tests, or docs.

## Review Checklist Before Public Push

Before pushing publicly:

- Run the token source scan.
- Run repo-wide forbidden marker scan.
- Search manually for brand-specific names.
- Inspect package tarball contents if publishing.
- Inspect Storybook built static files if deploying.
- Confirm no raw zips are present.
- Confirm no private assets are present.
- Confirm example content is generic.

## Incident Response

If private material is accidentally committed:

1. Make the repo private immediately if possible.
2. Remove the material.
3. Rotate any exposed credentials.
4. Rewrite Git history if the material was sensitive.
5. Force-push only if appropriate and understood.
6. Document what happened and how the scan will catch it next time.

For the demo repo, prevention is much easier than cleanup.
