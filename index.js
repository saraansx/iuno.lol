const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const net = require("node:net");
const path = require("node:path");

const root = __dirname;
const port = process.env.PORT || process.env.SERVER_PORT || "3000";
const host = process.env.BIND_HOST || "0.0.0.0";
const nextBin = path.join(root, "node_modules", "next", "dist", "bin", "next");
const buildId = path.join(root, ".next", "BUILD_ID");
const stamp = path.join(root, ".next", "COMMIT_SHA");

const headSha = () => {
  const r = spawnSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" });
  return r.status === 0 ? r.stdout.trim() : "";
};

const needsBuild = () => {
  if (!fs.existsSync(buildId)) return true;
  const sha = headSha();
  if (!sha) return false;
  try {
    return fs.readFileSync(stamp, "utf8").trim() !== sha;
  } catch {
    return true;
  }
};

if (needsBuild()) {
  console.log("[deploy] no matching production build, running next build...");
  const built = spawnSync("npm", ["run", "build"], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (built.status !== 0) {
    console.error("[deploy] build failed, refusing to start");
    process.exit(built.status ?? 1);
  }
  const sha = headSha();
  if (sha) fs.writeFileSync(stamp, sha);
}

const child = spawn(process.execPath, [nextBin, "start", "-H", host, "-p", port], {
  cwd: root,
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("exit", (code, signal) => process.exit(signal ? 1 : code ?? 0));

const announceReady = () => {
  const socket = net.connect({ host: "127.0.0.1", port: Number(port) });
  socket.once("connect", () => {
    socket.destroy();
    console.log("change this text 1");
  });
  socket.once("error", () => {
    socket.destroy();
    setTimeout(announceReady, 500);
  });
};

announceReady();
