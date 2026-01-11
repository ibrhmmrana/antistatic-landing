/**
 * Cross-platform Playwright browser install for deploys.
 *
 * Why:
 * - In serverless deploys, Playwright often fails at runtime if Chromium is not downloaded.
 * - Setting PLAYWRIGHT_BROWSERS_PATH=0 stores browsers inside node_modules so they can be bundled.
 */

const { spawnSync } = require("child_process");

const env = {
  ...process.env,
  PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || "0",
};

const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";
const args = ["playwright", "install", "chromium"];

console.log(`[postinstall] Installing Playwright browsers: ${npxCmd} ${args.join(" ")}`);
console.log(`[postinstall] PLAYWRIGHT_BROWSERS_PATH=${env.PLAYWRIGHT_BROWSERS_PATH}`);

const res = spawnSync(npxCmd, args, { stdio: "inherit", env });

if (res.status !== 0) {
  console.error(`[postinstall] Playwright install failed with exit code ${res.status}`);
  process.exit(res.status || 1);
}


