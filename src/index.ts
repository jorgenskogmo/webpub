import { join } from "node:path";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

import { runBuild, startDevServer, startWatcher, setConfig } from "./dev.js";
import { cleanDestinationDirectory } from "./utils.js";
import type { WebpubConfig, WebpubOptions } from "./types.js";

export * from "./types.js";

import * as defaultTheme from "./themes/default/index.js";
import { imgPlugin } from "./plugins/img/index.js";
import { srcsetPlugin } from "./plugins/srcset/index.js";
// import { srcsetPlugin } from "./plugins/srcset/index.js";

const configFileName = "webpub.config.js";

const config: WebpubConfig = {
  name: "", // will be set in defineConfig()
  version: "", // will be set in defineConfig()
  webpub_version: "0.0.0-alpha",

  content_directory: join(process.cwd(), "content"),
  output_directory: join(process.cwd(), "site"),
  theme_directory: join(import.meta.dirname, "themes/default"),

  theme: defaultTheme,
  plugins: [imgPlugin],

  marked_options: { gfm: true, breaks: true },
  open_browser: true,
  devserver_enabled: true,
  devserver_port: 3000,

  webpub_isdev: process.argv.includes("dev"),
};

export async function defineConfig(conf: WebpubOptions) {
  const userPackageFile = join(process.cwd(), "package.json");
  const userPackage = JSON.parse(await readFile(userPackageFile, "utf-8"));

  if (!conf.name) config.name = userPackage.name || "webpub site";
  if (!conf.version) config.version = userPackage.version || "0.0.1";

  // remove the default imgPlugin if srcsetPlugin is used
  if (conf.plugins?.includes(srcsetPlugin)) {
    console.log("webpub: srcsetPlugin detected in config");
    // config.plugins.remove(imgPlugin);
    config.plugins = config.plugins.filter((p) => p !== imgPlugin);
  }

  Object.assign(config, conf);
  console.log("webpub: plugins:", config.plugins);

  const packageFile = join(import.meta.dirname, "../package.json");
  const packageJson = JSON.parse(await readFile(packageFile, "utf-8"));
  if (packageJson.version) config.webpub_version = packageJson.version;

  if (conf.theme_directory) {
    config.theme_directory = join(process.cwd(), config.theme_directory);
  }

  if (!existsSync(config.content_directory)) {
    console.error(
      `webpub: Content directory not found ${config.content_directory}`
    );
    process.exit(1);
  }

  start(config);
}

// called by cli
export async function main() {
  const configPath = join(process.cwd(), configFileName);
  if (existsSync(configPath)) {
    // config file found. The config file will call defineConfig, then start()
    await import(configPath);
  } else {
    // run with default config
    console.log(`webpub: '${configFileName}' file not found. Using defaults.`);
    defineConfig(config);
  }
}

async function start(config: WebpubConfig) {
  // console.log("webpub: start() config:", config);

  console.log(`# webpub version: ${config.webpub_version} starting`);

  if (!config) {
    console.error("webpub.start: missing configuration");
    return;
  }

  setConfig(config);
  cleanDestinationDirectory(config);

  if (!config.devserver_enabled || !config.webpub_isdev) {
    console.log("# Running in build-only mode...");
    await runBuild();
    return;
  }

  startWatcher();
  startDevServer();

  setTimeout(() => {
    runBuild();
  }, 10);
}
