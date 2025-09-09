import { join } from "node:path";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

import { runBuild, startDevServer, startWatcher, setConfig } from "./dev.js";
import { cleanDestinationDirectory } from "./utils.js";
import type { WebpubConfig, WebpubOptions } from "./types.js";

export * from "./types.js";

import * as defaultTheme from "./themes/default/index.js";
import { srcsetPlugin } from "./plugins/srcset/index.js";

const configFileName = "webpub.config.ts";

const config: WebpubConfig = {
  name: "webpub default",
  version: "0.0.1",
  content_directory: join(process.cwd(), "content"),
  output_directory: join(process.cwd(), "site"),
  theme_directory: join(import.meta.dirname, "themes/default"),

  theme: defaultTheme,
  plugins: [srcsetPlugin],

  marked_options: { gfm: true, breaks: true },
  open_browser: true,
  devserver_enabled: true,
  devserver_port: 3000,
};

export async function defineConfig(conf: WebpubOptions) {
  Object.assign(config, conf);

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
  // console.log("webpub: start()");
  // console.log("webpub: start() config:", config);

  const pkgUrl = join(import.meta.dirname, "../package.json");
  const { version } = JSON.parse(await readFile(pkgUrl, "utf-8"));
  console.log(`# webpub version: ${version} starting`);

  if (!config) {
    console.error("webpub.start: missing configuration");
    return;
  }

  setConfig(config);
  cleanDestinationDirectory(config);

  if (!config.devserver_enabled) {
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
