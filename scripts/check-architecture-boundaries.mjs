import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";

const workspacePackages = [
  {
    name: "@demo-ds/token-pipeline",
    directory: "packages/token-pipeline",
    allowedWorkspaceDependencies: [],
    allowedWorkspaceImports: []
  },
  {
    name: "@demo-ds/tokens",
    directory: "packages/tokens",
    allowedWorkspaceDependencies: ["@demo-ds/token-pipeline"],
    allowedWorkspaceImports: ["@demo-ds/token-pipeline"]
  },
  {
    name: "@demo-ds/mantine-theme",
    directory: "packages/mantine-theme",
    allowedWorkspaceDependencies: ["@demo-ds/tokens"],
    allowedWorkspaceImports: ["@demo-ds/tokens"]
  },
  {
    name: "@demo-ds/components",
    directory: "packages/components",
    allowedWorkspaceDependencies: ["@demo-ds/mantine-theme"],
    allowedWorkspaceImports: ["@demo-ds/mantine-theme"]
  },
  {
    name: "@demo-ds/storybook",
    directory: "apps/storybook",
    allowedWorkspaceDependencies: [
      "@demo-ds/components",
      "@demo-ds/mantine-theme",
      "@demo-ds/tokens"
    ],
    allowedWorkspaceImports: ["@demo-ds/components", "@demo-ds/mantine-theme", "@demo-ds/tokens"]
  },
  {
    name: "@demo-ds/example",
    directory: "apps/example",
    allowedWorkspaceDependencies: [
      "@demo-ds/components",
      "@demo-ds/mantine-theme",
      "@demo-ds/tokens"
    ],
    allowedWorkspaceImports: ["@demo-ds/components", "@demo-ds/mantine-theme", "@demo-ds/tokens"]
  }
];

const sourceExtensions = new Set([".js", ".mjs", ".ts", ".tsx", ".mdx"]);
const ignoredDirectories = new Set([".turbo", "dist", "node_modules", "storybook-static"]);
const appPackageNames = new Set(["@demo-ds/storybook", "@demo-ds/example"]);
const publicDeclarationFirewallPackages = new Set([
  "@demo-ds/mantine-theme",
  "@demo-ds/components"
]);

const rootDirectory = process.cwd();
const packageByName = new Map(workspacePackages.map((pkg) => [pkg.name, pkg]));
const packageByDirectory = new Map(workspacePackages.map((pkg) => [toPosix(pkg.directory), pkg]));
const packageJsonByName = new Map();
const failures = [];

for (const pkg of workspacePackages) {
  const packageJson = JSON.parse(
    await readFile(join(rootDirectory, pkg.directory, "package.json"), "utf8")
  );
  packageJsonByName.set(pkg.name, packageJson);
}

checkPackageNames();
checkManifestDependencies();
await checkSourceImports();
await checkPublicDeclarations();

if (failures.length > 0) {
  console.error("Architecture boundary check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Architecture boundary check passed for ${workspacePackages.length} workspaces.`);

function checkPackageNames() {
  for (const pkg of workspacePackages) {
    const packageJson = packageJsonByName.get(pkg.name);
    if (packageJson?.name !== pkg.name) {
      failures.push(
        `${pkg.directory}/package.json: expected package name ${pkg.name}, found ${packageJson?.name}`
      );
    }
  }
}

function checkManifestDependencies() {
  for (const pkg of workspacePackages) {
    const packageJson = packageJsonByName.get(pkg.name);
    const allowed = new Set(pkg.allowedWorkspaceDependencies);

    for (const section of ["dependencies", "devDependencies", "peerDependencies"]) {
      const dependencies = packageJson?.[section] ?? {};
      for (const dependencyName of Object.keys(dependencies)) {
        if (!dependencyName.startsWith("@demo-ds/")) {
          continue;
        }

        if (!packageByName.has(dependencyName)) {
          failures.push(
            `${pkg.directory}/package.json: unknown workspace dependency ${dependencyName}`
          );
          continue;
        }

        if (!allowed.has(dependencyName)) {
          failures.push(
            `${pkg.directory}/package.json: ${section} may not depend on ${dependencyName}`
          );
        }

        if (
          dependencyName === "@demo-ds/token-pipeline" &&
          !(pkg.name === "@demo-ds/tokens" && section === "devDependencies")
        ) {
          failures.push(
            `${pkg.directory}/package.json: @demo-ds/token-pipeline must stay a build-time devDependency of @demo-ds/tokens only`
          );
        }
      }
    }
  }
}

async function checkSourceImports() {
  for (const pkg of workspacePackages) {
    const files = await collectFiles(join(rootDirectory, pkg.directory));
    const allowedWorkspaceImports = new Set(pkg.allowedWorkspaceImports);

    for (const file of files) {
      const source = await readFile(file, "utf8");
      const imports = extractImportSpecifiers(source);
      const relativeFile = toPosix(relative(rootDirectory, file));

      for (const specifier of imports) {
        if (specifier.startsWith("@demo-ds/")) {
          checkWorkspaceImport({
            pkg,
            allowedWorkspaceImports,
            relativeFile,
            specifier
          });
        }

        if (appPackageNames.has(pkg.name) && specifier.startsWith("@mantine/")) {
          failures.push(
            `${relativeFile}: apps must import design-system APIs instead of ${specifier}`
          );
        }

        if (isRelativeImport(specifier)) {
          checkRelativeImportBoundary({ pkg, file, relativeFile, specifier });
        }
      }
    }
  }
}

function checkWorkspaceImport({ pkg, allowedWorkspaceImports, relativeFile, specifier }) {
  const importedPackageName = getWorkspacePackageName(specifier);
  if (importedPackageName === undefined) {
    failures.push(`${relativeFile}: unknown @demo-ds import ${specifier}`);
    return;
  }

  if (importedPackageName === pkg.name) {
    failures.push(
      `${relativeFile}: import package internals relatively instead of self-importing ${specifier}`
    );
    return;
  }

  if (!allowedWorkspaceImports.has(importedPackageName)) {
    failures.push(`${relativeFile}: ${pkg.name} may not import ${importedPackageName}`);
  }

  if (!isPublicExportSpecifier(specifier)) {
    failures.push(`${relativeFile}: ${specifier} is not a public package export`);
  }
}

function checkRelativeImportBoundary({ pkg, file, relativeFile, specifier }) {
  const target = toPosix(resolve(dirname(file), specifier));
  const owner = packageForAbsolutePath(target);

  if (owner !== undefined && owner.name !== pkg.name) {
    failures.push(`${relativeFile}: relative import ${specifier} crosses into ${owner.directory}`);
  }
}

async function checkPublicDeclarations() {
  for (const packageName of publicDeclarationFirewallPackages) {
    const pkg = packageByName.get(packageName);
    const packageJson = packageJsonByName.get(packageName);
    const typeTargets = collectPublicTypeTargets(packageJson?.exports);

    for (const target of typeTargets) {
      const declarationPath = join(rootDirectory, pkg.directory, target);
      let source;
      try {
        source = await readFile(declarationPath, "utf8");
      } catch {
        failures.push(
          `${pkg.directory}/package.json: public type export ${target} is missing; run pnpm build first`
        );
        continue;
      }

      if (source.includes("@mantine/")) {
        failures.push(
          `${toPosix(
            relative(rootDirectory, declarationPath)
          )}: public declarations must not expose Mantine types`
        );
      }
    }
  }
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) {
      continue;
    }

    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
      continue;
    }

    if (entry.isFile() && sourceExtensions.has(extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

function extractImportSpecifiers(source) {
  const imports = [];
  const lines = stripMarkdownCodeFences(source).split(/\r?\n/u);
  let statement = "";

  for (const line of lines) {
    if (statement === "" && !/^\s*(?:import|export)\b/u.test(line)) {
      continue;
    }

    statement = statement === "" ? line : `${statement}\n${line}`;
    if (!/[;]\s*(?:\/\/.*)?$/u.test(line) && !/^\s*import\s+["'][^"']+["']\s*$/u.test(line)) {
      continue;
    }

    imports.push(...extractSpecifiersFromStatement(statement));
    statement = "";
  }

  if (statement !== "") {
    imports.push(...extractSpecifiersFromStatement(statement));
  }

  return imports;
}

function extractSpecifiersFromStatement(statement) {
  const specifiers = [];
  for (const pattern of [
    /\bimport\s+(?:type\s+)?(?:[^"'`]*?\s+from\s+)?["']([^"']+)["']/gsu,
    /\bexport\s+(?:type\s+)?[^"'`]*?\s+from\s+["']([^"']+)["']/gsu
  ]) {
    for (const match of statement.matchAll(pattern)) {
      specifiers.push(match[1]);
    }
  }
  return specifiers;
}

function stripMarkdownCodeFences(source) {
  const lines = source.split(/\r?\n/u);
  let inFence = false;

  return lines
    .filter((line) => {
      if (/^\s*```/u.test(line)) {
        inFence = !inFence;
        return false;
      }
      return !inFence;
    })
    .join("\n");
}

function getWorkspacePackageName(specifier) {
  const [scope, packageName] = specifier.split("/");
  const workspacePackageName = `${scope}/${packageName}`;
  return packageByName.has(workspacePackageName) ? workspacePackageName : undefined;
}

function isPublicExportSpecifier(specifier) {
  const packageName = getWorkspacePackageName(specifier);
  if (packageName === undefined) {
    return false;
  }

  if (specifier === packageName) {
    return true;
  }

  const packageJson = packageJsonByName.get(packageName);
  const subpath = `.${specifier.slice(packageName.length)}`;
  return hasExport(packageJson?.exports, subpath);
}

function hasExport(exports, subpath) {
  return exports !== null && typeof exports === "object" && Object.hasOwn(exports, subpath);
}

function isRelativeImport(specifier) {
  return specifier.startsWith("./") || specifier.startsWith("../");
}

function packageForAbsolutePath(absolutePath) {
  const relativePath = toPosix(relative(rootDirectory, absolutePath));
  for (const [directory, pkg] of packageByDirectory) {
    if (relativePath === directory || relativePath.startsWith(`${directory}/`)) {
      return pkg;
    }
  }
  return undefined;
}

function collectPublicTypeTargets(exports) {
  const targets = new Set();
  collectPublicTypeTargetsInto(exports, targets);
  return [...targets].sort();
}

function collectPublicTypeTargetsInto(value, targets) {
  if (value === null || typeof value !== "object") {
    return;
  }

  if (typeof value.types === "string") {
    targets.add(value.types);
  }

  for (const child of Object.values(value)) {
    collectPublicTypeTargetsInto(child, targets);
  }
}

function toPosix(filePath) {
  return filePath.split(sep).join("/");
}
