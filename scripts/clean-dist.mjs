import { rm } from "node:fs/promises";
import { relative, resolve, sep } from "node:path";

const target = resolve(process.cwd(), process.argv[2] ?? "dist");
const relativeTarget = relative(process.cwd(), target);

if (
  relativeTarget === "" ||
  relativeTarget.startsWith("..") ||
  relativeTarget.includes(`..${sep}`) ||
  (relativeTarget !== "dist" && !relativeTarget.startsWith(`dist${sep}`))
) {
  throw new Error(`Refusing to remove non-dist path: ${target}`);
}

await rm(target, { force: true, recursive: true });
console.log(`Removed ${relativeTarget}`);
