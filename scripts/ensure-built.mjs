import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const requiredPath = process.argv[2];

if (typeof requiredPath !== "string") {
  console.error("Usage: node scripts/ensure-built.mjs <required-file>");
  process.exit(1);
}

if (existsSync(resolve(process.cwd(), requiredPath))) {
  process.exit(0);
}

const command = "pnpm";
const args = ["run", "build"];

const child = spawn(command, args, {
  cwd: process.cwd(),
  shell: process.platform === "win32",
  stdio: "inherit"
});

child.on("exit", (code, signal) => {
  if (typeof code === "number") {
    process.exit(code);
  }

  console.error(`${command} ${args.join(" ")} exited from signal ${signal ?? "unknown"}`);
  process.exit(1);
});

child.on("error", (error) => {
  console.error(`${command} ${args.join(" ")} failed: ${error.message}`);
  process.exit(1);
});
