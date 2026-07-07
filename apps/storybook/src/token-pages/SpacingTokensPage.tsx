import { ScalePreview, TokenTable } from "./TokenTable.js";
import type { TokenDoc } from "./tokenDocs.js";
import { groupsStartingWith } from "./tokenDocs.js";

function preview(token: TokenDoc) {
  if (typeof token.value !== "number") {
    return null;
  }

  return <ScalePreview value={`${Math.max(token.value, 2)}px`} />;
}

export function SpacingTokensPage() {
  return (
    <div className="docs-page">
      <h1>Spacing Tokens</h1>
      <p>
        Spacing values come from generated dimension tokens. Mantine maps a small subset
        to named spacing keys while the full scale remains available as CSS variables.
      </p>
      <TokenTable
        caption="Spacing scale"
        groups={groupsStartingWith("space")}
        renderPreview={preview}
      />
    </div>
  );
}
