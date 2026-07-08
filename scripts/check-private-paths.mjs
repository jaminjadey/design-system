import { execFileSync } from "node:child_process";

const forbiddenTrackedPrefixes = [".private/", "tokens/raw/", "tokens/imported/"];

const trackedFiles = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"]
})
  .split("\0")
  .filter(Boolean);

const failures = trackedFiles.filter((filePath) =>
  forbiddenTrackedPrefixes.some((prefix) => filePath.startsWith(prefix))
);

if (failures.length > 0) {
  console.error("Private path check failed. These files must never be committed:");
  for (const filePath of failures) {
    console.error(`- ${filePath}`);
  }
  process.exit(1);
}

console.log("Private path check passed.");
