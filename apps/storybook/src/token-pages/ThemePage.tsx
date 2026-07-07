import { demoTheme } from "@demo-ds/mantine-theme";

import { ModePreview } from "./ModePreview.js";

export function ThemePage() {
  return (
    <div className="docs-page">
      <h1>Theme</h1>
      <p>
        The Mantine theme consumes generated token package exports. Primitive token
        palettes become Mantine colour tuples, common spacing and radius values map to
        Mantine keys, and semantic colours remain available through CSS variables.
      </p>
      <dl className="metadata-grid">
        <div>
          <dt>Primary colour</dt>
          <dd>{demoTheme.primaryColor}</dd>
        </div>
        <div>
          <dt>Primary shades</dt>
          <dd>{demoTheme.colors?.primary?.length ?? "-"}</dd>
        </div>
        <div>
          <dt>Default radius</dt>
          <dd>{demoTheme.defaultRadius}</dd>
        </div>
        <div>
          <dt>Heading font</dt>
          <dd>{demoTheme.headings?.fontFamily ?? "-"}</dd>
        </div>
      </dl>
      <ModePreview>
        <div className="mode-demo-card">
          <strong>Semantic variables</strong>
          <span>Text and background change with Mantine colour scheme.</span>
        </div>
      </ModePreview>
    </div>
  );
}
