import { demoThemeSummary } from "@demo-ds/mantine-theme";

import { ModePreview } from "./ModePreview.js";

export function ThemePage() {
  return (
    <div className="docs-page">
      <h1>Theme</h1>
      <p>
        The theme adapter consumes generated token package exports. Primitive token palettes, common
        spacing, radius, and typography values are mapped behind the design-system provider, while
        semantic colours remain available through CSS variables.
      </p>
      <dl className="metadata-grid">
        <div>
          <dt>Primary colour</dt>
          <dd>{demoThemeSummary.primaryColor}</dd>
        </div>
        <div>
          <dt>Primary shades</dt>
          <dd>{demoThemeSummary.primaryShadeCount}</dd>
        </div>
        <div>
          <dt>Default radius</dt>
          <dd>{demoThemeSummary.defaultRadius}</dd>
        </div>
        <div>
          <dt>Heading font</dt>
          <dd>{demoThemeSummary.headingFontFamily}</dd>
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
