import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const packablePackages = [
  {
    directory: "packages/tokens",
    allowedFiles: ["README.md", "package.json"],
    allowedDirectories: ["dist"],
    requiredFiles: [
      "dist/build-report.json",
      "dist/canonical.json",
      "dist/index.d.ts",
      "dist/index.js",
      "dist/metadata.json",
      "dist/token-docs.json",
      "dist/token-names.d.ts",
      "dist/token-names.js",
      "dist/token-quality.json",
      "dist/token-quality.md",
      "dist/tokens.css",
      "dist/tokens.dark.css",
      "dist/tokens.light.css"
    ]
  },
  {
    directory: "packages/mantine-theme",
    allowedFiles: ["README.md", "package.json", "styles.css"],
    allowedDirectories: ["dist"],
    requiredFiles: ["dist/index.d.ts", "dist/index.js", "styles.css"]
  },
  {
    directory: "packages/components",
    allowedFiles: ["README.md", "package.json"],
    allowedDirectories: ["dist"],
    requiredFiles: ["dist/index.d.ts", "dist/index.js"]
  }
];

const forbiddenPathPatterns = [
  {
    pattern: /(^|\/)\.private(\/|$)/u,
    message: "private local material must not be packed"
  },
  {
    pattern: /(^|\/)fixtures(\/|$)/u,
    message: "source fixtures must not be packed"
  },
  {
    pattern: /(^|\/)src(\/|$)/u,
    message: "source files must not be packed"
  },
  {
    pattern: /(^|\/)tests?(\/|$)/u,
    message: "tests must not be packed"
  },
  {
    pattern: /(^|\/)storybook-static(\/|$)/u,
    message: "built Storybook output must not be packed"
  },
  {
    pattern: /(^|\/)node_modules(\/|$)/u,
    message: "dependencies must not be packed"
  },
  {
    pattern: /(^|\/)\.turbo(\/|$)/u,
    message: "build cache files must not be packed"
  },
  {
    pattern: /\.stories\.[cm]?[jt]sx?$/u,
    message: "Storybook stories must not be packed"
  },
  {
    pattern: /(?<!\.d)\.tsx?$/u,
    message: "TypeScript source files must not be packed"
  },
  {
    pattern: /(^|\/)tsconfig\.json$/u,
    message: "TypeScript project config must not be packed"
  }
];

const rootDirectory = process.cwd();
const npmCommand = "npm";
const failures = [];
const summaries = [];

for (const packageConfig of packablePackages) {
  const packageDirectory = join(rootDirectory, packageConfig.directory);
  const packageJson = JSON.parse(await readFile(join(packageDirectory, "package.json"), "utf8"));
  const packedFiles = await dryRunPack(packageDirectory, packageJson.name);
  const packedPathSet = new Set(packedFiles.map((file) => file.path));

  checkRequiredFiles({ packageConfig, packageJson, packedPathSet });
  checkExportTargets({ packageConfig, packageJson, packedPathSet });
  checkPackedPaths({ packageConfig, packageJson, packedFiles });

  summaries.push(`${packageJson.name}: ${packedFiles.length} files`);
}

if (failures.length > 0) {
  console.error("Package tarball check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Package tarball check passed for ${summaries.join(", ")}.`);

async function dryRunPack(packageDirectory, packageName) {
  const { stdout } = await execFileAsync(npmCommand, ["pack", "--dry-run", "--json"], {
    cwd: packageDirectory,
    maxBuffer: 10 * 1024 * 1024,
    shell: process.platform === "win32"
  });
  const packOutput = JSON.parse(stdout);
  const packageOutput = packOutput[0];

  if (!Array.isArray(packageOutput?.files)) {
    throw new Error(`${packageName}: npm pack dry-run did not return file details`);
  }

  return packageOutput.files;
}

function checkRequiredFiles({ packageConfig, packageJson, packedPathSet }) {
  for (const requiredFile of ["README.md", "package.json", ...packageConfig.requiredFiles]) {
    if (!packedPathSet.has(requiredFile)) {
      failures.push(`${packageJson.name}: tarball is missing ${requiredFile}`);
    }
  }
}

function checkExportTargets({ packageConfig, packageJson, packedPathSet }) {
  const targets = new Set();
  addTarget(targets, packageJson.main);
  addTarget(targets, packageJson.types);
  collectExportTargets(packageJson.exports, targets);

  for (const target of [...targets].sort()) {
    if (!packedPathSet.has(target)) {
      failures.push(`${packageJson.name}: exported target ${target} is not in the tarball`);
    }
  }

  if (!Array.isArray(packageJson.files) || packageJson.files.length === 0) {
    failures.push(`${packageJson.name}: package manifest must define a files allowlist`);
    return;
  }

  for (const entry of packageJson.files) {
    const normalizedEntry = normalizePackagePath(entry);
    const isAllowedFile = packageConfig.allowedFiles.includes(normalizedEntry);
    const isAllowedDirectory = packageConfig.allowedDirectories.includes(normalizedEntry);
    if (!isAllowedFile && !isAllowedDirectory) {
      failures.push(`${packageJson.name}: files entry is not expected: ${entry}`);
    }
  }
}

function checkPackedPaths({ packageConfig, packageJson, packedFiles }) {
  for (const file of packedFiles) {
    const path = normalizePackagePath(file.path);

    if (!isAllowedPackedPath(packageConfig, path)) {
      failures.push(`${packageJson.name}: unexpected tarball file ${path}`);
    }

    for (const { pattern, message } of forbiddenPathPatterns) {
      if (pattern.test(path)) {
        failures.push(`${packageJson.name}: ${path}: ${message}`);
      }
    }
  }
}

function isAllowedPackedPath(packageConfig, path) {
  if (packageConfig.allowedFiles.includes(path)) {
    return true;
  }

  return packageConfig.allowedDirectories.some((directory) => path.startsWith(`${directory}/`));
}

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
    targets.add(normalizePackagePath(value));
  }
}

function normalizePackagePath(path) {
  return path.replace(/^\.\//u, "").replace(/\\/gu, "/");
}

function execFileAsync(command, args, options) {
  return new Promise((resolve, reject) => {
    execFile(command, args, options, (error, stdout, stderr) => {
      if (error !== null) {
        reject(new Error(`${command} ${args.join(" ")} failed: ${stderr || error.message}`));
        return;
      }

      resolve({ stdout, stderr });
    });
  });
}
