# 14 - Security and public-demo rules

## Core rule

The public repo must demonstrate process, not expose private source material.

## Forbidden content

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

## Token-specific risks

Design tokens can be sensitive because they may expose:

- Brand palette fingerprints.
- Product-specific semantic naming.
- Accessibility decisions.
- Source-tool IDs.
- Proprietary typography.
- Internal implementation structure.

The sanitised fixture bundle is safe enough for a demo because values and identifying names were replaced. Still, treat all future fixture changes as risky until scanned and reviewed.

## Required repo scan

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

## Allowlist policy

Some docs may mention forbidden marker names as examples. Keep a narrow allowlist for known documentation files if needed.

Prefer wording docs to avoid repeated sensitive names. If the scanner has to allow too much, the docs should be rewritten.

## Secret scanning

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

## Public copy rules

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

## Visual assets

Use no external brand imagery. For icons, use an open-source icon library with a compatible license.

Do not use private icon exports from the source design system.

## Fonts

Use system fonts or open fonts installed through normal package/CDN workflows.

Do not copy private font files. Do not include private font family names in CSS, tests, or docs.

## Review checklist before public push

Before pushing publicly:

- Run fixture safety scan.
- Run repo-wide forbidden marker scan.
- Search manually for internal names.
- Inspect package tarball contents if publishing.
- Inspect Storybook built static files if deploying.
- Confirm no raw zips are present.
- Confirm no private assets are present.
- Confirm example content is generic.

## Incident response

If private material is accidentally committed:

1. Make the repo private immediately if possible.
2. Remove the material.
3. Rotate any exposed credentials.
4. Rewrite Git history if the material was sensitive.
5. Force-push only if appropriate and understood.
6. Document what happened and how the scan will catch it next time.

For the demo repo, prevention is much easier than cleanup.
