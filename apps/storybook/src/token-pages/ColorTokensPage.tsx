import { ColorSwatch, TokenTable } from "./TokenTable.js";
import type { TokenDoc } from "./tokenDocs.js";
import { groupsStartingWith } from "./tokenDocs.js";

function colorPreview(token: TokenDoc) {
  if (typeof token.value === "string") {
    return <ColorSwatch value={token.value} label={token.name} />;
  }

  if (typeof token.value === "object" && "light" in token.value && "dark" in token.value) {
    return (
      <span className="semantic-swatch">
        <ColorSwatch value={token.value.light ?? "transparent"} label={`${token.name} light`} />
        <ColorSwatch value={token.value.dark ?? "transparent"} label={`${token.name} dark`} />
      </span>
    );
  }

  return null;
}

export function ColorTokensPage() {
  return (
    <div className="docs-page">
      <h1>Colour Tokens</h1>
      <p>
        Colour documentation is rendered from generated token docs data. Primitive palettes feed the
        internal theme adapter; semantic colours are exposed as CSS variables with light and dark
        values.
      </p>
      <TokenTable
        caption="Primitive colour tokens"
        groups={groupsStartingWith("color.primitive")}
        renderPreview={colorPreview}
      />
      <TokenTable
        caption="Semantic colour tokens"
        groups={groupsStartingWith("color.semantic")}
        renderPreview={colorPreview}
      />
    </div>
  );
}
