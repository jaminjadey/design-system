import { readdir, stat } from "node:fs/promises";
import { extname, join, relative } from "node:path";

export interface DiscoveredFixtureFile {
  readonly absolutePath: string;
  readonly relativePath: string;
  readonly extension: string;
  readonly isTextLike: boolean;
}

export const textFixtureExtensions = new Set([
  ".css",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".ts",
  ".txt",
  ".tsx",
  ".yaml",
  ".yml"
]);

export async function discoverFixtureFiles(
  rootDirectory: string
): Promise<DiscoveredFixtureFile[]> {
  const rootStats = await stat(rootDirectory);
  if (!rootStats.isDirectory()) {
    throw new Error(`Fixture path is not a directory: ${rootDirectory}`);
  }

  const files = await walkDirectory(rootDirectory, rootDirectory);
  return files.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
}

async function walkDirectory(
  rootDirectory: string,
  currentDirectory: string
): Promise<DiscoveredFixtureFile[]> {
  const entries = await readdir(currentDirectory, { withFileTypes: true });
  const files: DiscoveredFixtureFile[] = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const absolutePath = join(currentDirectory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkDirectory(rootDirectory, absolutePath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = extname(entry.name).toLowerCase();
    files.push({
      absolutePath,
      relativePath: relative(rootDirectory, absolutePath).replaceAll("\\", "/"),
      extension,
      isTextLike: textFixtureExtensions.has(extension)
    });
  }

  return files;
}
