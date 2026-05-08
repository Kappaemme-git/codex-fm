#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const appFile = path.join(rootDir, "assets", "codex-fm", "index.html");

function fileUrl(filePath) {
  const resolved = path.resolve(filePath).replace(/\\/g, "/");
  const prefix = resolved.startsWith("/") ? "file://" : "file:///";
  return prefix + encodeURI(resolved);
}

function openUrl(url) {
  const platform = process.platform;
  const attempts =
    platform === "darwin"
      ? [
          ["open", ["-a", "Google Chrome", url]],
          ["open", [url]],
        ]
      : platform === "win32"
        ? [["cmd", ["/c", "start", "", url]]]
        : [
            ["google-chrome", [url]],
            ["xdg-open", [url]],
          ];

  const run = (index) => {
    if (!attempts[index]) {
      console.log(url);
      return;
    }

    const [command, args] = attempts[index];
    const child = execFile(command, args, { windowsHide: true }, (error) => {
      if (error) run(index + 1);
    });
    child.unref();
  };

  run(0);
}

if (!fs.existsSync(appFile)) {
  console.error(`Codex FM asset not found: ${appFile}`);
  process.exit(1);
}

const url = fileUrl(appFile);
openUrl(url);
console.log(`Codex FM opened at ${url}`);
