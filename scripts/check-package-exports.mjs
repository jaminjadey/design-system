import { access, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const packageDirectories = [
  "packages/token-pipeline",
  "packages/tokens",
  "packages/mantine-theme",
  "packages/components"
];
const packageReadyDirectories = new Set([
  "packages/tokens",
  "packages/mantine-theme",
  "packages/components"
]);
const requiredTokenExports = [
  "./tokens.css",
  "./tokens.light.css",
  "./tokens.dark.css",
  "./canonical.json",
  "./metadata.json",
  "./token-docs.json",
  "./build-report.json",
  "./token-quality.json",
  "./token-quality.md"
];
const requiredRuntimePeers = ["react", "react-dom", "@mantine/core", "@mantine/hooks"];

const failures = [];

for (const packageDirectory of packageDirectories) {
  const packageJsonPath = join(packageDirectory, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const targets = new Set();

  addTarget(targets, packageJson.main);
  addTarget(targets, packageJson.types);
  collectExportTargets(packageJson.exports, targets);

  if (packageReadyDirectories.has(packageDirectory)) {
    await checkPackageReadiness(packageDirectory, packageJson);
  }

  if (packageJson.name === "@demo-ds/tokens") {
    for (const exportName of requiredTokenExports) {
      if (!hasExport(packageJson.exports, exportName)) {
        failures.push(`${packageJson.name}: missing required export ${exportName}`);
      }
    }
  }

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

async function checkPackageReadiness(packageDirectory, packageJson) {
  try {
    await access(join(packageDirectory, "README.md"));
  } catch {
    failures.push(`${packageJson.name}: missing README.md`);
  }

  if (!Array.isArray(packageJson.files) || packageJson.files.length === 0) {
    failures.push(`${packageJson.name}: missing package files field`);
  }

  for (const fileEntry of packageJson.files ?? []) {
    try {
      await access(join(packageDirectory, fileEntry));
    } catch {
      failures.push(`${packageJson.name}: files entry does not exist: ${fileEntry}`);
    }
  }

  if (packageJson.name === "@demo-ds/mantine-theme" || packageJson.name === "@demo-ds/components") {
    for (const dependencyName of requiredRuntimePeers) {
      if (packageJson.peerDependencies?.[dependencyName] === undefined) {
        failures.push(`${packageJson.name}: missing peer dependency ${dependencyName}`);
      }
    }
  }
}

function hasExport(exports, exportName) {
  return exports !== null && typeof exports === "object" && Object.hasOwn(exports, exportName);
}
