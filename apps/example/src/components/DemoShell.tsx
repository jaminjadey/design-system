import type { ReactNode } from "react";

import type { AppPageId } from "../App.js";

interface DemoShellProps {
  readonly pages: ReadonlyArray<{ id: AppPageId; label: string }>;
  readonly activePage: AppPageId;
  readonly onPageChange: (pageId: AppPageId) => void;
  readonly utility?: ReactNode;
  readonly children: ReactNode;
}

export function DemoShell({ pages, activePage, onPageChange, utility, children }: DemoShellProps) {
  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Primary navigation">
        <div className="app-brand">
          <span className="app-brand__mark" aria-hidden="true" />
          <span>
            <strong>Demo DS</strong>
            <small>Example app</small>
          </span>
        </div>
        <nav className="app-nav">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              className="app-nav__item"
              data-active={page.id === activePage || undefined}
              aria-current={page.id === activePage ? "page" : undefined}
              onClick={() => onPageChange(page.id)}
            >
              {page.label}
            </button>
          ))}
        </nav>
      </aside>
      <div className="app-main">
        <header className="app-topbar">{utility}</header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  );
}
