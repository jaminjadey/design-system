import type { ReactNode } from "react";

export function ModePreview({ children }: { readonly children: ReactNode }) {
  return (
    <div className="mode-preview">
      <div className="mode-preview__panel" data-mantine-color-scheme="light">
        <span className="mode-preview__label">Light</span>
        {children}
      </div>
      <div className="mode-preview__panel" data-mantine-color-scheme="dark">
        <span className="mode-preview__label">Dark</span>
        {children}
      </div>
    </div>
  );
}
