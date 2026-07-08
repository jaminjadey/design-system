import type { TokenDoc } from "./tokenDocs.js";
import { groupsStartingWith } from "./tokenDocs.js";

function typographyValue(token: TokenDoc) {
  if (typeof token.value !== "object" || !("fontSize" in token.value)) {
    return undefined;
  }

  return token.value;
}

export function TypographyTokensPage() {
  const groups = groupsStartingWith("typography");
  const tokens = groups.flatMap((group) => group.tokens);

  return (
    <div className="docs-page">
      <h1>Typography Tokens</h1>
      <p>
        Typography docs render generated token data. The theme package maps heading styles into
        Mantine headings with a generic system font stack.
      </p>
      <table className="token-table">
        <caption>Typography styles</caption>
        <thead>
          <tr>
            <th scope="col">Preview</th>
            <th scope="col">Name</th>
            <th scope="col">Font size</th>
            <th scope="col">Line height</th>
            <th scope="col">Weight</th>
          </tr>
        </thead>
        <tbody>
          {tokens.map((token) => {
            const value = typographyValue(token);
            return (
              <tr key={token.name}>
                <td>
                  {value === undefined ? null : (
                    <span
                      style={{
                        fontSize: `${value.fontSize}px`,
                        lineHeight: `${value.lineHeight}px`,
                        fontWeight: value.fontWeight
                      }}
                    >
                      Aa
                    </span>
                  )}
                </td>
                <td>
                  <code>{token.name}</code>
                </td>
                <td>{value?.fontSize ?? "-"}</td>
                <td>{value?.lineHeight ?? "-"}</td>
                <td>{value?.fontWeight ?? "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
