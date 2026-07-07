import { cssVar, metadata, tokenNameToCssVariable, type TokenName } from "@demo-ds/tokens";
import { Card, StatusBadge } from "@demo-ds/components";

const showcasedTokens: TokenName[] = [
  "color.semantic.background.body",
  "color.semantic.background.card",
  "color.semantic.text.default",
  "color.semantic.text.light",
  "color.semantic.border.light",
  "space.md",
  "space.xl",
  "radius.md",
  "radius.xl",
  "typography.heading.h1"
];

function TokenPreview({ tokenName }: { readonly tokenName: TokenName }) {
  const isColor = tokenName.startsWith("color.");
  const isSpace = tokenName.startsWith("space.");
  const isRadius = tokenName.startsWith("radius.");

  if (isColor) {
    return <span className="token-chip" style={{ background: cssVar(tokenName) }} />;
  }

  if (isSpace) {
    return <span className="space-chip" style={{ width: cssVar(tokenName) }} />;
  }

  if (isRadius) {
    return <span className="radius-chip" style={{ borderRadius: cssVar(tokenName) }} />;
  }

  return <span className="type-token-preview">Aa</span>;
}

export function TokensPage() {
  return (
    <section className="page-section" aria-labelledby="tokens-heading">
      <div className="section-heading">
        <h2 id="tokens-heading">Tokens</h2>
        <p>Runtime token data consumed through the generated package exports.</p>
      </div>

      <div className="metric-grid">
        <Card className="metric-card">
          <span className="metric-card__label">Token count</span>
          <strong className="metric-card__value">{metadata.tokenCount}</strong>
          <StatusBadge tone="info">generated</StatusBadge>
        </Card>
        <Card className="metric-card">
          <span className="metric-card__label">Modes</span>
          <strong className="metric-card__value">{metadata.modes.join(" / ")}</strong>
          <StatusBadge tone="success">semantic</StatusBadge>
        </Card>
        <Card className="metric-card">
          <span className="metric-card__label">Categories</span>
          <strong className="metric-card__value">{metadata.categories.length}</strong>
          <StatusBadge tone="neutral">public API</StatusBadge>
        </Card>
      </div>

      <Card>
        <table className="token-table">
          <caption>Selected generated tokens</caption>
          <thead>
            <tr>
              <th scope="col">Preview</th>
              <th scope="col">Token</th>
              <th scope="col">CSS variable</th>
            </tr>
          </thead>
          <tbody>
            {showcasedTokens.map((tokenName) => (
              <tr key={tokenName}>
                <td>
                  <TokenPreview tokenName={tokenName} />
                </td>
                <td>
                  <code>{tokenName}</code>
                </td>
                <td>
                  <code>{tokenNameToCssVariable[tokenName]}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
