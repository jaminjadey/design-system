import tokenQualityJson from "@demo-ds/tokens/token-quality.json";

interface TokenQualityReport {
  readonly status: "pass" | "warn" | "fail";
  readonly summary: {
    readonly tokenCount: number;
    readonly sourceRecordsRead: number | null;
    readonly recordsMapped: number | null;
    readonly recordsSkipped: number | null;
    readonly unsupportedRecordCount: number | null;
    readonly warningCount: number;
    readonly errorCount: number;
  };
  readonly categories: Readonly<Record<string, number>>;
  readonly tokenTypes: Readonly<Record<string, number>>;
  readonly css: {
    readonly tokensWithCssOutput: number;
    readonly tokenCount: number;
    readonly coveragePercent: number;
    readonly directCssVariables: number;
    readonly typographyGeneratedVariables: number;
    readonly duplicateCssVariables: readonly string[];
    readonly tokensWithoutCssOutput: readonly string[];
  };
  readonly modes: {
    readonly semanticColors: {
      readonly total: number;
      readonly complete: number;
      readonly missing: readonly unknown[];
    };
    readonly shadows: {
      readonly total: number;
      readonly complete: number;
      readonly missing: readonly unknown[];
    };
  };
  readonly source: {
    readonly generatedFiles: readonly string[];
    readonly files: ReadonlyArray<{
      readonly file: string;
      readonly mappedRecords: number;
      readonly generatedTokens: number;
      readonly tokenTypes: readonly string[];
    }>;
  };
  readonly findings: ReadonlyArray<{
    readonly severity: "error" | "warning";
    readonly code: string;
    readonly message: string;
  }>;
}

const tokenQuality = tokenQualityJson as TokenQualityReport;

export function TokenQualityPage() {
  return (
    <div className="docs-page">
      <h1>Token Quality</h1>
      <p>
        This page reads the generated token quality report from the token package. It gives
        developers a reviewable summary of the current token contract without reading source token
        files.
      </p>

      <dl className="metadata-grid">
        <div>
          <dt>Status</dt>
          <dd>{tokenQuality.status}</dd>
        </div>
        <div>
          <dt>Tokens</dt>
          <dd>{tokenQuality.summary.tokenCount}</dd>
        </div>
        <div>
          <dt>CSS coverage</dt>
          <dd>{tokenQuality.css.coveragePercent}%</dd>
        </div>
        <div>
          <dt>Findings</dt>
          <dd>{tokenQuality.findings.length}</dd>
        </div>
      </dl>

      <QualitySummaryTable />
      <CountTable caption="Category coverage" label="Category" counts={tokenQuality.categories} />
      <CountTable caption="Token type coverage" label="Type" counts={tokenQuality.tokenTypes} />
      <ModeCoverageTable />
      <SourceCoverageTable />
      <GeneratedFilesTable />
      <FindingsTable />
    </div>
  );
}

function QualitySummaryTable() {
  const rows: Array<readonly [string, string | number]> = [
    ["Source records read", formatNullable(tokenQuality.summary.sourceRecordsRead)],
    ["Records mapped", formatNullable(tokenQuality.summary.recordsMapped)],
    ["Records skipped", formatNullable(tokenQuality.summary.recordsSkipped)],
    ["Unsupported records", formatNullable(tokenQuality.summary.unsupportedRecordCount)],
    ["Direct CSS variables", tokenQuality.css.directCssVariables],
    ["Typography generated variables", tokenQuality.css.typographyGeneratedVariables],
    ["Tokens without CSS output", tokenQuality.css.tokensWithoutCssOutput.length],
    ["Duplicate CSS variables", tokenQuality.css.duplicateCssVariables.length],
    ["Warnings", tokenQuality.summary.warningCount],
    ["Errors", tokenQuality.summary.errorCount]
  ];

  return (
    <table className="token-table">
      <caption>Quality summary</caption>
      <thead>
        <tr>
          <th scope="col">Metric</th>
          <th scope="col">Value</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([metric, value]) => (
          <tr key={metric}>
            <td>{metric}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function CountTable({
  caption,
  label,
  counts
}: {
  readonly caption: string;
  readonly label: string;
  readonly counts: Readonly<Record<string, number>>;
}) {
  return (
    <table className="token-table">
      <caption>{caption}</caption>
      <thead>
        <tr>
          <th scope="col">{label}</th>
          <th scope="col">Tokens</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(counts).map(([name, count]) => (
          <tr key={name}>
            <td>{name}</td>
            <td>{count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ModeCoverageTable() {
  const rows: Array<readonly [string, TokenQualityReport["modes"]["semanticColors"]]> = [
    ["Semantic colours", tokenQuality.modes.semanticColors],
    ["Shadows", tokenQuality.modes.shadows]
  ];

  return (
    <table className="token-table">
      <caption>Mode coverage</caption>
      <thead>
        <tr>
          <th scope="col">Group</th>
          <th scope="col">Total</th>
          <th scope="col">Complete</th>
          <th scope="col">Missing</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([label, coverage]) => (
          <tr key={label}>
            <td>{label}</td>
            <td>{coverage.total}</td>
            <td>{coverage.complete}</td>
            <td>{coverage.missing.length}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SourceCoverageTable() {
  return (
    <table className="token-table">
      <caption>Source coverage</caption>
      <thead>
        <tr>
          <th scope="col">File</th>
          <th scope="col">Mapped records</th>
          <th scope="col">Generated tokens</th>
          <th scope="col">Token types</th>
        </tr>
      </thead>
      <tbody>
        {tokenQuality.source.files.map((file) => (
          <tr key={file.file}>
            <td>
              <code>{file.file}</code>
            </td>
            <td>{file.mappedRecords}</td>
            <td>{file.generatedTokens}</td>
            <td>{file.tokenTypes.join(", ") || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GeneratedFilesTable() {
  return (
    <table className="token-table">
      <caption>Generated files</caption>
      <thead>
        <tr>
          <th scope="col">File</th>
        </tr>
      </thead>
      <tbody>
        {tokenQuality.source.generatedFiles.map((file) => (
          <tr key={file}>
            <td>
              <code>{file}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function FindingsTable() {
  return (
    <table className="token-table">
      <caption>Findings</caption>
      <thead>
        <tr>
          <th scope="col">Severity</th>
          <th scope="col">Code</th>
          <th scope="col">Message</th>
        </tr>
      </thead>
      <tbody>
        {tokenQuality.findings.length === 0 ? (
          <tr>
            <td colSpan={3}>No findings.</td>
          </tr>
        ) : (
          tokenQuality.findings.map((finding) => (
            <tr key={`${finding.severity}-${finding.code}-${finding.message}`}>
              <td>{finding.severity}</td>
              <td>
                <code>{finding.code}</code>
              </td>
              <td>{finding.message}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function formatNullable(value: number | null): string {
  return value === null ? "-" : String(value);
}
