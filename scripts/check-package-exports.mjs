import { access, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const packageDirectories = [
  "packages/token-pipeline",
  "packages/tokens",
  "packages/mantine-theme",
  "packages/components"
];

const failures = [];

for (const packageDirectory of packageDirectories) {
  const packageJsonPath = join(packageDirectory, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const targets = new Set();

  addTarget(targets, packageJson.main);
  addTarget(targets, packageJson.types);
  collectExportTargets(packageJson.exports, targets);

  for (const target of [...targets].sort()) {
    const targetPath = join(packageDirectory, target);
    try {
      await access(targetPath);
    } catch {
      failures.push(`${packageJson.name}: missing export target ${target}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Package export check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Package export check passed for ${packageDirectories
    .map((directory) => relative(process.cwd(), directory))
    .join(", ")}.`
);

function collectExportTargets(value, targets) {
  if (typeof value === "string") {
    addTarget(targets, value);
    return;
  }

  if (value === null || typeof value !== "object") {
    return;
  }

  for (const child of Object.values(value)) {
    collectExportTargets(child, targets);
  }
}

function addTarget(targets, value) {
  if (typeof value === "string" && value.startsWith("./")) {
    targets.add(value);
  }
}
