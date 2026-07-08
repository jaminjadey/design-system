import { access, readFile } from "node:fs/promises";
import { join } from "node:path";

const workspacePackages = [
  { directory: "packages/token-pipeline", role: "tooling" },
  { directory: "packages/tokens", role: "release" },
  { directory: "packages/mantine-theme", role: "release" },
  { directory: "packages/components", role: "release" },
  { directory: "apps/storybook", role: "app" },
  { directory: "apps/example", role: "app" }
];

const releasePackageNames = new Set([
  "@demo-ds/tokens",
  "@demo-ds/mantine-theme",
  "@demo-ds/components"
]);
const privatePackageNames = new Set([
  "@demo-ds/token-pipeline",
  "@demo-ds/storybook",
  "@demo-ds/example"
]);
const mantinePackages = ["@mantine/core", "@mantine/hooks"];
const reactPackages = ["react", "react-dom"];
const failures = [];

const rootPackageJson = await readPackageJson("package.json");
const packageJsonByName = new Map();
const workspaceByName = new Map();

if (!/^pnpm@\d+\.\d+\.\d+$/u.test(rootPackageJson.packageManager ?? "")) {
  failures.push("root package.json: packageManager must pin an exact pnpm version");
}

for (const workspace of workspacePackages) {
  const packageJson = await readPackageJson(join(workspace.directory, "package.json"));
  packageJsonByName.set(packageJson.name, packageJson);
  workspaceByName.set(packageJson.name, workspace);

  if (!packageJson.name?.startsWith("@demo-ds/")) {
    failures.push(`${workspace.directory}/package.json: package name must use @demo-ds scope`);
  }

  if (packageJson.version !== rootPackageJson.version) {
    failures.push(
      `${workspace.directory}/package.json: version ${packageJson.version} must match root ${rootPackageJson.version}`
    );
  }

  if (workspace.role !== "release" && packageJson.private !== true) {
    failures.push(`${packageJson.name}: non-release workspace must stay private`);
  }

  checkWorkspaceDependencyRanges(workspace.directory, packageJson);
}

for (const packageName of releasePackageNames) {
  const packageJson = packageJsonByName.get(packageName);
  const directory = workspaceByName.get(packageName)?.directory;

  if (packageJson === undefined || directory === undefined) {
    failures.push(`${packageName}: release package is missing from workspace list`);
    continue;
  }

  await checkReleasePackage({ directory, packageJson });
}

for (const packageName of privatePackageNames) {
  if (!packageJsonByName.has(packageName)) {
    failures.push(`${packageName}: private workspace is missing from workspace list`);
  }
}

checkImplementationDependencyPolicy();

if (failures.length > 0) {
  console.error("Release readiness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  "Release readiness check passed for @demo-ds/tokens, @demo-ds/mantine-theme, @demo-ds/components."
);

async function readPackageJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function checkReleasePackage({ directory, packageJson }) {
  if (packageJson.private !== true) {
    failures.push(
      `${packageJson.name}: demo release packages stay private until publishing is deliberate`
    );
  }

  if (!Array.isArray(packageJson.files) || packageJson.files.length === 0) {
    failures.push(`${packageJson.name}: missing files allowlist`);
  }

  if (packageJson.main === undefined || packageJson.types === undefined) {
    failures.push(`${packageJson.name}: missing main/types package entries`);
  }

  if (packageJson.exports === undefined) {
    failures.push(`${packageJson.name}: missing exports map`);
  }

  try {
    await access(join(directory, "README.md"));
  } catch {
    failures.push(`${packageJson.name}: missing package README.md`);
  }
}

function checkWorkspaceDependencyRanges(directory, packageJson) {
  for (const section of ["dependencies", "devDependencies", "peerDependencies"]) {
    for (const [dependencyName, range] of Object.entries(packageJson[section] ?? {})) {
      if (dependencyName.startsWith("@demo-ds/") && range !== "workspace:*") {
        failures.push(
          `${directory}/package.json: ${section}.${dependencyName} must use workspace:*`
        );
      }
    }
  }
}

function checkImplementationDependencyPolicy() {
  const themePackage = packageJsonByName.get("@demo-ds/mantine-theme");
  const componentsPackage = packageJsonByName.get("@demo-ds/components");
  const storybookPackage = packageJsonByName.get("@demo-ds/storybook");
  const examplePackage = packageJsonByName.get("@demo-ds/example");
  const requiredPackages = [themePackage, componentsPackage, storybookPackage, examplePackage];

  if (requiredPackages.some((packageJson) => packageJson === undefined)) {
    failures.push(
      "release dependency policy could not run because a required workspace is missing"
    );
    return;
  }

  for (const packageJson of [themePackage, componentsPackage]) {
    for (const dependencyName of mantinePackages) {
      if (packageJson.dependencies?.[dependencyName] === undefined) {
        failures.push(
          `${packageJson.name}: missing Mantine implementation dependency ${dependencyName}`
        );
      }

      if (packageJson.peerDependencies?.[dependencyName] !== undefined) {
        failures.push(
          `${packageJson.name}: must not expose ${dependencyName} as a peer dependency`
        );
      }

      if (packageJson.devDependencies?.[dependencyName] !== undefined) {
        failures.push(`${packageJson.name}: duplicate Mantine devDependency ${dependencyName}`);
      }
    }

    for (const dependencyName of reactPackages) {
      if (packageJson.peerDependencies?.[dependencyName] === undefined) {
        failures.push(`${packageJson.name}: missing React peer dependency ${dependencyName}`);
      }

      if (packageJson.dependencies?.[dependencyName] !== undefined) {
        failures.push(`${packageJson.name}: must not bundle React dependency ${dependencyName}`);
      }
    }
  }

  for (const dependencyName of mantinePackages) {
    checkSameRange(dependencyName, [
      {
        packageName: themePackage.name,
        section: "dependencies",
        range: themePackage.dependencies?.[dependencyName]
      },
      {
        packageName: componentsPackage.name,
        section: "dependencies",
        range: componentsPackage.dependencies?.[dependencyName]
      }
    ]);
  }

  for (const dependencyName of reactPackages) {
    checkSameRange(dependencyName, [
      {
        packageName: themePackage.name,
        section: "peerDependencies",
        range: themePackage.peerDependencies?.[dependencyName]
      },
      {
        packageName: componentsPackage.name,
        section: "peerDependencies",
        range: componentsPackage.peerDependencies?.[dependencyName]
      },
      {
        packageName: storybookPackage.name,
        section: "dependencies",
        range: storybookPackage.dependencies?.[dependencyName]
      },
      {
        packageName: examplePackage.name,
        section: "dependencies",
        range: examplePackage.dependencies?.[dependencyName]
      }
    ]);
  }

  for (const appPackage of [storybookPackage, examplePackage]) {
    for (const dependencyName of mantinePackages) {
      if (
        appPackage.dependencies?.[dependencyName] !== undefined ||
        appPackage.devDependencies?.[dependencyName] !== undefined
      ) {
        failures.push(`${appPackage.name}: apps should not depend on Mantine directly`);
      }
    }
  }
}

function checkSameRange(dependencyName, entries) {
  const ranges = entries.filter((entry) => typeof entry.range === "string");
  const expectedRange = ranges[0]?.range;

  for (const entry of ranges) {
    if (entry.range !== expectedRange) {
      failures.push(
        `${entry.packageName}: ${entry.section}.${dependencyName} range ${entry.range} must match ${expectedRange}`
      );
    }
  }
}
