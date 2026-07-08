import { readFile } from "node:fs/promises";
import { join } from "node:path";

const reportPath = process.argv[2] ?? join("packages", "tokens", "dist", "token-quality.json");

try {
  const report = JSON.parse(await readFile(reportPath, "utf8"));

  if (!isTokenQualityReport(report)) {
    throw new Error("Token quality report has an unexpected shape.");
  }

  const summary = [
    `status=${report.status}`,
    `tokens=${report.summary.tokenCount}`,
    `css=${report.css.coveragePercent}%`,
    `warnings=${report.summary.warningCount}`,
    `errors=${report.summary.errorCount}`
  ].join(" ");

  if (report.status === "fail") {
    console.error(`Token quality check failed: ${summary}`);
    for (const finding of report.findings) {
      console.error(`- ${finding.severity} ${finding.code}: ${finding.message}`);
    }
    process.exit(1);
  }

  if (report.status === "warn") {
    console.warn(`Token quality check passed with warnings: ${summary}`);
    for (const finding of report.findings) {
      console.warn(`- ${finding.severity} ${finding.code}: ${finding.message}`);
    }
  } else {
    console.log(`Token quality check passed: ${summary}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Token quality check failed: ${message}`);
  process.exit(1);
}

function isTokenQualityReport(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    ["pass", "warn", "fail"].includes(value.status) &&
    isSummary(value.summary) &&
    isCssReport(value.css) &&
    Array.isArray(value.findings)
  );
}

function isSummary(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.tokenCount === "number" &&
    typeof value.warningCount === "number" &&
    typeof value.errorCount === "number"
  );
}

function isCssReport(value) {
  return value !== null && typeof value === "object" && typeof value.coveragePercent === "number";
}
