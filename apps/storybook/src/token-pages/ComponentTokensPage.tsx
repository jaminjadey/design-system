import { ColorSwatch, ScalePreview, TokenTable } from "./TokenTable.js";
import type { TokenDoc } from "./tokenDocs.js";
import { groupsStartingWith } from "./tokenDocs.js";

function componentPreview(token: TokenDoc) {
  if (
    token.valueType === "color" &&
    typeof token.value === "object" &&
    "light" in token.value &&
    "dark" in token.value &&
    typeof token.value.light === "string" &&
    typeof token.value.dark === "string"
  ) {
    return (
      <span className="semantic-swatch">
        <ColorSwatch value={token.value.light} label={`${token.name} light`} />
        <ColorSwatch value={token.value.dark} label={`${token.name} dark`} />
      </span>
    );
  }

  if (token.valueType === "dimension" && typeof token.value === "number") {
    return <ScalePreview value={`${token.value}${token.unit ?? "px"}`} />;
  }

  return null;
}

export function ComponentTokensPage() {
  return (
    <div className="docs-page">
      <h1>Component Tokens</h1>
      <p>
        Component tokens are generated from synthetic component-level source files. They encode
        design-system decisions for wrapper components such as button variants, badge states, alert
        banners, cards, and text inputs.
      </p>
      <TokenTable
        caption="Component-level design tokens"
        groups={groupsStartingWith("component")}
        renderPreview={componentPreview}
      />
    </div>
  );
}
