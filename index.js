const { spawn } = require("node:child_process");
const path = require("node:path");

const port = process.env.PORT || process.env.SERVER_PORT || "3000";
const host = process.env.HOSTNAME || "0.0.0.0";
const bin = path.join(__dirname, "node_modules", "next", "dist", "bin", "next");

const child = spawn(process.execPath, [bin, "start", "-H", host, "-p", port], {
  cwd: __dirname,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => process.exit(signal ? 1 : code ?? 0));
