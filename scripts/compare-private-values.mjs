import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const privateRoots = [".private", "tokens/raw", "tokens/imported"];
const publicRoots = ["packages/tokens/fixtures/extracted", "packages/tokens/dist"];
const textExtensions = new Set([".css", ".json", ".js", ".md", ".mdx", ".ts", ".tsx", ".txt"]);
const jsonExtensions = new Set([".json"]);
const valueKeys = new Set(["$value", "value", "hex"]);
const genericValues = new Set([
  "",
  "0",
  "1",
  "true",
  "false",
  "null",
  "transparent",
  "currentcolor",
  "none",
  "light",
  "dark",
  "default",
  "#000",
  "#0000",
  "#000000",
  "#00000000",
  "#fff",
  "#ffff",
  "#ffffff",
  "#ffffffff"
]);

const rootDirectory = process.cwd();
const privateFiles = await collectExistingFiles(privateRoots);
const publicFiles = await collectExistingFiles(publicRoots);

if (privateFiles.length === 0) {
  console.error("Private value comparison failed: no private input files were found.");
  console.error("Expected local-only files under .private/, tokens/raw/, or tokens/imported/.");
  process.exit(1);
}

const privateValues = await collectPrivateValues(privateFiles);
const publicValues = await collectPublicValues(publicFiles);
const comparison = compareValues(privateValues, publicValues);

printSummary({
  privateFiles,
  publicFiles,
  privateValues,
  publicValues,
  comparison
});

if (comparison.nonGenericMatches.length > 0) {
  console.error("");
  console.error(
    "Private value comparison failed: non-generic exact private values were found in public token files."
  );
  console.error("Private values are redacted. Public locations:");
  for (const finding of comparison.nonGenericMatches.slice(0, 50)) {
    console.error(`- ${finding.file}:${finding.path} (${finding.kind})`);
  }
  if (comparison.nonGenericMatches.length > 50) {
    console.error(`- ...and ${comparison.nonGenericMatches.length - 50} more public locations`);
  }
  process.exit(1);
}

console.log("");
console.log("Private value comparison passed: no non-generic exact private values found.");

async function collectExistingFiles(rootPaths) {
  const files = [];

  for (const rootPath of rootPaths) {
    const absoluteRoot = join(rootDirectory, rootPath);
    if (!(await pathExists(absoluteRoot))) {
      continue;
    }
    files.push(...(await collectFiles(absoluteRoot)));
  }

  return files
    .filter((filePath) => textExtensions.has(extensionOf(filePath)))
    .sort((left, right) =>
      toPosix(relative(rootDirectory, left)).localeCompare(toPosix(relative(rootDirectory, right)))
    );
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(absolutePath);
    }
  }

  return files;
}

async function collectPrivateValues(files) {
  const values = new Map();

  for (const absolutePath of files) {
    const relativePath = toPosix(relative(rootDirectory, absolutePath));
    const text = await readFile(absolutePath, "utf8");

    if (jsonExtensions.has(extensionOf(absolutePath))) {
      collectJsonDesignValues(values, parseJsonIfPossible(text), relativePath, [], false);
      continue;
    }

    collectTextComparableValues(values, text, relativePath);
  }

  return values;
}

async function collectPublicValues(files) {
  const values = new Map();

  for (const absolutePath of files) {
    const relativePath = toPosix(relative(rootDirectory, absolutePath));
    const text = await readFile(absolutePath, "utf8");

    if (jsonExtensions.has(extensionOf(absolutePath))) {
      collectJsonDesignValues(values, parseJsonIfPossible(text), relativePath, [], false);
      continue;
    }

    collectCssCustomPropertyValues(values, text, relativePath);
    collectHexValues(values, text, relativePath);
  }

  return values;
}

function collectJsonDesignValues(values, value, filePath, path, isDesignValue) {
  if (value === undefined) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((child, index) =>
      collectJsonDesignValues(values, child, filePath, [...path, String(index)], isDesignValue)
    );
    return;
  }

  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      collectJsonObjectChild(child, values, filePath, path, key, isDesignValue);
    }
    return;
  }

  if (isDesignValue) {
    addComparableValue(values, value, {
      file: filePath,
      path: path.length === 0 ? "$" : path.join(".")
    });
  }
}

function collectJsonObjectChild(child, values, filePath, path, key, parentIsDesignValue) {
  const normalisedKey = key.toLowerCase();
  collectJsonDesignValues(
    values,
    child,
    filePath,
    [...path, key],
    parentIsDesignValue ||
      isDesignValueKey(normalisedKey) ||
      (isPrimitive(child) && (normalisedKey === "color" || normalisedKey === "colour"))
  );
}

function collectTextComparableValues(values, text, filePath) {
  collectHexValues(values, text, filePath);
}

function collectCssCustomPropertyValues(values, text, filePath) {
  const pattern = /(--ds-[\w-]+)\s*:\s*([^;]+);/gu;
  for (const match of text.matchAll(pattern)) {
    addComparableValue(values, match[2], {
      file: filePath,
      path: match[1]
    });
  }
}

function collectHexValues(values, text, filePath) {
  const pattern = /#[0-9a-fA-F]{3,8}\b/gu;
  for (const match of text.matchAll(pattern)) {
    addComparableValue(values, match[0], {
      file: filePath,
      path: `hex@${getLineNumber(text, match.index)}`
    });
  }
}

function addComparableValue(values, rawValue, location) {
  const comparable = toComparableValue(rawValue);
  if (comparable === undefined) {
    return;
  }

  const existing = values.get(comparable.key);
  const entry = existing ?? {
    kind: comparable.kind,
    locations: []
  };

  entry.locations.push(location);
  values.set(comparable.key, entry);
}

function compareValues(privateValues, publicValues) {
  const genericMatches = [];
  const numericMatches = [];
  const nonGenericMatches = [];

  for (const [key, publicEntry] of publicValues.entries()) {
    if (!privateValues.has(key)) {
      continue;
    }

    const bucket = getMatchBucket(key, publicEntry.kind);
    const publicLocations = publicEntry.locations.map((location) => ({
      ...location,
      kind: publicEntry.kind
    }));

    if (bucket === "generic") {
      genericMatches.push(...publicLocations);
      continue;
    }
    if (bucket === "numeric") {
      numericMatches.push(...publicLocations);
      continue;
    }

    nonGenericMatches.push(...publicLocations);
  }

  return {
    genericMatches,
    numericMatches,
    nonGenericMatches
  };
}

function getMatchBucket(key, kind) {
  if (genericValues.has(key)) {
    return "generic";
  }
  if (kind === "number") {
    return "numeric";
  }
  return "non-generic";
}

function toComparableValue(rawValue) {
  if (typeof rawValue === "number") {
    if (!Number.isFinite(rawValue)) {
      return undefined;
    }
    return {
      key: String(rawValue),
      kind: "number"
    };
  }

  if (typeof rawValue === "boolean" || rawValue === null) {
    return undefined;
  }

  if (typeof rawValue !== "string") {
    return undefined;
  }

  const trimmed = rawValue.trim();
  if (trimmed.length === 0) {
    return undefined;
  }

  const hex = /^#[0-9a-fA-F]{3,8}$/u.exec(trimmed);
  if (hex !== null) {
    return {
      key: trimmed.toLowerCase(),
      kind: "color"
    };
  }

  if (/^-?\d+(?:\.\d+)?$/u.test(trimmed)) {
    return {
      key: String(Number(trimmed)),
      kind: "number"
    };
  }

  if (trimmed.length < 6) {
    return undefined;
  }

  return {
    key: trimmed.toLowerCase(),
    kind: "string"
  };
}

function printSummary({ privateFiles, publicFiles, privateValues, publicValues, comparison }) {
  console.log("Private value comparison summary");
  console.log("--------------------------------");
  console.log(`Private files read: ${privateFiles.length}`);
  console.log(`Public token files read: ${publicFiles.length}`);
  console.log(`Unique comparable private values: ${privateValues.size}`);
  console.log(`Unique comparable public values: ${publicValues.size}`);
  console.log(`Generic exact overlaps: ${comparison.genericMatches.length}`);
  console.log(`Numeric exact overlaps: ${comparison.numericMatches.length}`);
  console.log(`Non-generic exact overlaps: ${comparison.nonGenericMatches.length}`);
  console.log("");
  console.log("Private values are never printed by this command.");
}

function parseJsonIfPossible(text) {
  try {
    return JSON.parse(text.replace(/^\uFEFF/u, ""));
  } catch {
    return undefined;
  }
}

function isDesignValueKey(key) {
  return valueKeys.has(key);
}

function isPrimitive(value) {
  return value === null || (typeof value !== "object" && typeof value !== "function");
}

function getLineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/u).length;
}

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function extensionOf(filePath) {
  const index = filePath.lastIndexOf(".");
  return index === -1 ? "" : filePath.slice(index).toLowerCase();
}

function toPosix(filePath) {
  return filePath.split(sep).join("/");
}
