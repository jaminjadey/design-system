import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { createRequire } from "node:module";
import { extname, join, normalize, relative, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const staticDirectory = resolve(fileURLToPath(new URL("../storybook-static", import.meta.url)));
const require = createRequire(import.meta.url);
const axeSource = await readFile(require.resolve("axe-core/axe.min.js"), "utf8");
const colorSchemes = ["light", "dark"];
const axeOptions = {
  runOnly: {
    type: "tag",
    values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]
  }
};

test("built Storybook passes render, browser, theme, and accessibility QA", async () => {
  await assertBuiltStorybookExists();

  const server = await startStaticServer(staticDirectory);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const browserIssues = collectBrowserIssues(page);

  try {
    const baseUrl = `http://127.0.0.1:${server.port}`;
    const entries = await loadStorybookEntries(baseUrl);
    assert.ok(entries.length > 0, "Expected built Storybook to expose testable entries");

    for (const entry of entries) {
      for (const colorScheme of colorSchemes) {
        const issueIndex = browserIssues.length;
        await assertStorybookPage(
          page,
          storybookEntryUrl(baseUrl, entry, colorScheme),
          entry,
          colorScheme
        );
        assertNoNewBrowserIssues(browserIssues, issueIndex, `${entry.title} / ${entry.name}`);
      }
    }
  } finally {
    await page.close();
    await browser.close();
    await server.close();
  }
});

async function assertStorybookPage(page, url, entry, colorScheme) {
  await page.goto(url, { waitUntil: "networkidle" });
  const root = page.locator(".storybook-theme-root").first();
  await root.waitFor({ state: "visible", timeout: 10000 });
  assert.equal(await root.getAttribute("data-mantine-color-scheme"), colorScheme);

  const textContent = (await root.innerText()).trim();
  assert.ok(
    textContent.length > 0,
    `Expected ${entry.title} / ${entry.name} (${colorScheme}) to render visible text`
  );

  const errorDisplays = await page
    .locator(".sb-errordisplay:visible, [data-testid='error-message']:visible")
    .allTextContents();
  assert.deepEqual(errorDisplays, [], `Storybook rendered an error state for ${entry.id}`);

  await assertAccessible(page, entry, colorScheme);
}

async function assertBuiltStorybookExists() {
  try {
    await stat(join(staticDirectory, "iframe.html"));
  } catch {
    throw new Error(
      "Storybook smoke test requires apps/storybook/storybook-static. Run pnpm --filter @demo-ds/storybook build first."
    );
  }
}

async function loadStorybookEntries(baseUrl) {
  const response = await fetch(`${baseUrl}/index.json`);

  if (!response.ok) {
    throw new Error(
      `Could not load Storybook index.json: ${response.status} ${response.statusText}`
    );
  }

  const storybookIndex = await response.json();

  return Object.values(storybookIndex.entries)
    .filter((entry) => entry.type === "docs" || entry.type === "story")
    .sort((left, right) => left.id.localeCompare(right.id));
}

function storybookEntryUrl(baseUrl, entry, colorScheme) {
  const viewMode = entry.type === "docs" ? "docs" : "story";
  const parameters = new URLSearchParams({
    id: entry.id,
    viewMode,
    globals: `colorScheme:${colorScheme}`
  });

  return `${baseUrl}/iframe.html?${parameters.toString()}`;
}

async function assertAccessible(page, entry, colorScheme) {
  await page.addScriptTag({ content: axeSource });
  const results = await page.evaluate(
    async (options) => window.axe.run(".storybook-theme-root", options),
    axeOptions
  );

  if (results.violations.length > 0) {
    throw new Error(formatA11yViolations(entry, colorScheme, results.violations));
  }
}

function formatA11yViolations(entry, colorScheme, violations) {
  const details = violations
    .map((violation) => {
      const nodes = violation.nodes
        .slice(0, 3)
        .map((node) => `    - ${node.target.join(", ")}: ${node.failureSummary}`)
        .join("\n");

      return `  ${violation.id} (${violation.impact ?? "unknown impact"}): ${violation.help}\n${nodes}`;
    })
    .join("\n");

  return [
    `Accessibility violations in ${entry.title} / ${entry.name} (${entry.id}, ${colorScheme})`,
    details
  ].join("\n");
}

function collectBrowserIssues(page) {
  const issues = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      issues.push(`console error: ${message.text()}`);
    }
  });

  page.on("pageerror", (error) => {
    issues.push(`page error: ${error.message}`);
  });

  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();

    if (status >= 400 && !url.endsWith("/favicon.ico")) {
      issues.push(`http ${status}: ${url}`);
    }
  });

  return issues;
}

function assertNoNewBrowserIssues(issues, issueIndex, label) {
  const newIssues = issues.slice(issueIndex);

  assert.deepEqual(newIssues, [], `Browser issues while rendering ${label}`);
}

async function startStaticServer(rootDirectory) {
  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? "/", "http://127.0.0.1");
    const filePath = resolveStaticPath(rootDirectory, url.pathname);
    const fileStats = await safeStat(filePath);

    if (fileStats === undefined) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    const finalPath = fileStats.isDirectory() ? join(filePath, "index.html") : filePath;
    response.writeHead(200, { "content-type": contentType(finalPath) });
    createReadStream(finalPath).pipe(response);
  });

  await new Promise((resolveListen) => {
    server.listen(0, "127.0.0.1", resolveListen);
  });

  const address = server.address();
  if (address === null || typeof address === "string") {
    throw new Error("Could not start Storybook smoke test server");
  }

  return {
    port: address.port,
    close: () =>
      new Promise((resolveClose, rejectClose) => {
        server.close((error) => {
          if (error) {
            rejectClose(error);
            return;
          }
          resolveClose(undefined);
        });
      })
  };
}

function resolveStaticPath(rootDirectory, requestPath) {
  const requested = requestPath === "/" ? "/index.html" : requestPath;
  const normalised = normalize(requested).replace(/^([/\\])+/, "");
  const filePath = resolve(rootDirectory, normalised);
  const relativePath = relative(rootDirectory, filePath);

  if (relativePath.startsWith("..") || relativePath.split(sep).includes("..")) {
    return join(rootDirectory, "404");
  }

  return filePath;
}

async function safeStat(filePath) {
  try {
    return await stat(filePath);
  } catch {
    return undefined;
  }
}

function contentType(filePath) {
  switch (extname(filePath)) {
    case ".css":
      return "text/css; charset=utf-8";
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "application/octet-stream";
  }
}
