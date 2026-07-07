import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ignoredDirectories = new Set([".git", ".turbo", "node_modules", "dist", "storybook-static"]);
const checkedExtensions = new Set([
  ".json",
  ".js",
  ".mjs",
  ".ts",
  ".tsx",
  ".md",
  ".yaml",
  ".yml"
]);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) {
        files.push(...(await collectFiles(join(directory, entry.name))));
      }
      continue;
    }

    if (entry.isFile() && checkedExtensions.has(getExtension(entry.name))) {
      files.push(join(directory, entry.name));
    }
  }

  return files;
}

function getExtension(fileName) {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot === -1 ? "" : fileName.slice(lastDot);
}

const files = await collectFiles(process.cwd());
const failures = [];

for (const file of files) {
  const text = await readFile(file, "utf8");
  if (/\r\n/.test(text)) {
    failures.push(`${relative(process.cwd(), file)} uses CRLF line endings`);
  }
  if (/[ \t]+$/m.test(text)) {
    failures.push(`${relative(process.cwd(), file)} has trailing whitespace`);
  }
  if (text.length > 0 && !text.endsWith("\n")) {
    failures.push(`${relative(process.cwd(), file)} is missing a final newline`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Format check passed for ${files.length} files.`);
