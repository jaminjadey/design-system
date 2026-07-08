import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { extname, join, normalize, relative, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const staticDirectory = resolve(fileURLToPath(new URL("../storybook-static", import.meta.url)));

test("built Storybook renders key docs and component pages in light and dark modes", async () => {
  await assertBuiltStorybookExists();

  const server = await startStaticServer(staticDirectory);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    const baseUrl = `http://127.0.0.1:${server.port}`;
    await assertStorybookPage(page, `${baseUrl}/iframe.html?id=docs-getting-started--docs&viewMode=docs&globals=colorScheme:light`, "Getting Started", "light");
    await assertStorybookPage(page, `${baseUrl}/iframe.html?id=docs-token-pipeline--docs&viewMode=docs&globals=colorScheme:dark`, "Token Pipeline", "dark");
    await assertStorybookPage(page, `${baseUrl}/iframe.html?id=components-button--default&viewMode=story&globals=colorScheme:dark`, "Save changes", "dark");
  } finally {
    await page.close();
    await browser.close();
    await server.close();
  }
});

async function assertStorybookPage(page, url, text, colorScheme) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.getByText(text).first().waitFor({ state: "visible", timeout: 10000 });
  const root = page.locator(".storybook-theme-root").first();
  await root.waitFor({ state: "attached", timeout: 10000 });
  assert.equal(await root.getAttribute("data-mantine-color-scheme"), colorScheme);
}

async function assertBuiltStorybookExists() {
  try {
    await stat(join(staticDirectory, "iframe.html"));
  } catch {
    throw new Error("Storybook smoke test requires apps/storybook/storybook-static. Run pnpm --filter @demo-ds/storybook build first.");
  }
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
