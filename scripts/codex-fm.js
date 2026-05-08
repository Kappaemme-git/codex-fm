#!/usr/bin/env node

const { execFile } = require("child_process");

const siteUrl = "https://kappaemme-git.github.io/codex-fm/";

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

openUrl(siteUrl);
console.log(`Codex FM opened at ${siteUrl}`);
