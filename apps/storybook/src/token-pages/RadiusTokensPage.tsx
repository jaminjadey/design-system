import { TokenTable } from "./TokenTable.js";
import type { TokenDoc } from "./tokenDocs.js";
import { groupsStartingWith } from "./tokenDocs.js";

function preview(token: TokenDoc) {
  if (typeof token.value !== "number") {
    return null;
  }

  return (
    <span
      className="radius-preview"
      style={{ borderRadius: `${token.value}px` }}
      aria-label={`${token.name} radius preview`}
    />
  );
}

export function RadiusTokensPage() {
  return (
    <div className="docs-page">
      <h1>Radius Tokens</h1>
      <p>
        Radius tokens are generated from canonical radius values and mapped into Mantine
        radius keys for component defaults.
      </p>
      <TokenTable
        caption="Radius scale"
        groups={groupsStartingWith("radius")}
        renderPreview={preview}
      />
    </div>
  );
}
