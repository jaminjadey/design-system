import type { ReactNode } from "react";

import type { TokenDoc, TokenDocGroup } from "./tokenDocs.js";
import { tokenValueText } from "./tokenDocs.js";

export interface TokenTableProps {
  readonly caption: string;
  readonly groups: readonly TokenDocGroup[];
  readonly renderPreview?: (token: TokenDoc) => ReactNode;
}

export function TokenTable({ caption, groups, renderPreview }: TokenTableProps) {
  const tokens = groups.flatMap((group) =>
    group.tokens.map((token) => ({
      group: group.name,
      token
    }))
  );

  return (
    <table className="token-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Preview</th>
          <th scope="col">Name</th>
          <th scope="col">Group</th>
          <th scope="col">Value</th>
          <th scope="col">CSS variable</th>
        </tr>
      </thead>
      <tbody>
        {tokens.map(({ group, token }) => (
          <tr key={token.name}>
            <td>{renderPreview?.(token) ?? <span className="token-preview-empty">-</span>}</td>
            <td>
              <code>{token.name}</code>
            </td>
            <td>{group}</td>
            <td>{tokenValueText(token)}</td>
            <td>{token.cssVariable === undefined ? "-" : <code>{token.cssVariable}</code>}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function ColorSwatch({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <span className="color-swatch" title={label}>
      <span className="color-swatch__chip" style={{ background: value }} />
      <span>{value}</span>
    </span>
  );
}

export function ScalePreview({ value }: { readonly value: string }) {
  return <span className="scale-preview" style={{ width: value }} />;
}
