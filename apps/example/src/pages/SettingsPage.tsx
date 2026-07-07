import { AlertBanner, Card, StatusBadge, ThemeToggle } from "@demo-ds/components";

export function SettingsPage() {
  return (
    <section className="page-section" aria-labelledby="settings-heading">
      <div className="section-heading">
        <h2 id="settings-heading">Settings</h2>
        <p>Theme controls and token-driven type samples for a normal app surface.</p>
      </div>

      <div className="content-grid">
        <Card>
          <div className="card-stack">
            <h3>Theme</h3>
            <p className="muted-copy">
              Switch between light and dark modes. Mantine and generated token selectors share the
              same colour-scheme attribute.
            </p>
            <ThemeToggle lightLabel="Use light mode" darkLabel="Use dark mode" />
          </div>
        </Card>

        <Card>
          <div className="card-stack">
            <h3>Typography</h3>
            <div className="type-sample type-sample--large">Heading scale sample</div>
            <p className="muted-copy">
              Body copy uses the generic system font stack from the Mantine theme package.
            </p>
            <StatusBadge tone="info">Generic font stack</StatusBadge>
          </div>
        </Card>
      </div>

      <AlertBanner tone="warning" title="Review note">
        Settings are local to the demo app and do not use any product-specific data.
      </AlertBanner>
    </section>
  );
}
