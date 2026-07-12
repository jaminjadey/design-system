import {
  AlertBanner,
  Button,
  Card,
  LoadingSpinner,
  NotificationBanner,
  StatusBadge,
  Tooltip
} from "@demo-ds/components";

const healthItems = [
  { label: "Design tokens", value: "222", tone: "success" as const },
  { label: "Components", value: "13", tone: "info" as const },
  { label: "Open reviews", value: "3", tone: "warning" as const }
];

const tasks = [
  { title: "Review generated token docs", status: "Ready", tone: "success" as const },
  { title: "Check form error states", status: "Queued", tone: "neutral" as const },
  { title: "Validate dark mode surfaces", status: "Review", tone: "warning" as const }
];

export function OverviewPage() {
  return (
    <section className="page-section" aria-labelledby="overview-heading">
      <div className="section-heading">
        <h2 id="overview-heading">Overview</h2>
        <p>Generic project status using design-system surfaces and semantic tones.</p>
      </div>

      <AlertBanner tone="info" title="Package consumption check">
        This app imports public package exports only and uses generated token CSS variables at
        runtime.
      </AlertBanner>

      <NotificationBanner tone="success" title="Component tokens active">
        Additional wrappers are using synthetic component-level tokens for states, overlays, and
        controls.
      </NotificationBanner>

      <div className="metric-grid">
        {healthItems.map((item) => (
          <Card key={item.label} className="metric-card">
            <span className="metric-card__label">{item.label}</span>
            <strong className="metric-card__value">{item.value}</strong>
            <StatusBadge tone={item.tone}>{item.tone}</StatusBadge>
          </Card>
        ))}
      </div>

      <div className="content-grid">
        <Card>
          <div className="card-stack">
            <h3>Upcoming actions</h3>
            <div className="task-list">
              {tasks.map((task) => (
                <div className="task-row" key={task.title}>
                  <span>{task.title}</span>
                  <StatusBadge tone={task.tone}>{task.status}</StatusBadge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-stack">
            <h3>Button emphasis</h3>
            <div className="button-row">
              <Button emphasis="high">Primary action</Button>
              <Button emphasis="medium" tone="success">
                Confirm
              </Button>
              <Tooltip label="Secondary actions use neutral tokens">
                <Button emphasis="low" tone="neutral">
                  Secondary
                </Button>
              </Tooltip>
              <Button emphasis="medium" tone="danger">
                Remove
              </Button>
              <LoadingSpinner label="Syncing" size="sm" />
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
