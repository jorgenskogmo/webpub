import { join, resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";

import { runBuild, startDevServer, startWatcher, setConfig } from "./dev.js";
import { cleanDestinationDirectory } from "./utils.js";
// import { loadConfig } from "./configparser.js";
import type { WebpubConfig, WebpubOptions } from "./types.js";

export * from "./types.js";

import * as defaultTheme from "./themes/default/index.js";
import * as srcsetPlugin from "./plugins/srcset/index.js";

const configFileName = "webpub.config.ts";

const defaultOptions: WebpubConfig = {
  name: "webpub default",
  version: "0.0.1",
  content_directory: join(process.cwd(), "content"),
  output_directory: join(process.cwd(), "site"),

  theme: defaultTheme,
  theme_directory: "./themes/default",
  plugins: [srcsetPlugin],
  image_widths: [150, 300, 600, 1200], // FIXME: this is a srcset plugin config - should not be here

  marked_options: { gfm: true, breaks: true },
  open_browser: true,
  devserver_enabled: true,
  devserver_port: 3000,
};

export async function defineConfig(conf: WebpubOptions) {
  // console.log("defineConfig()");
  // console.log("defineConfig:: defaul config:", defaultOptions);
  // console.log("defineConfig:: passed config:", conf);
  let config: WebpubConfig = { ...defaultOptions, ...conf };

  // Make sure key directories exits
  if (!existsSync(config.content_directory)) {
    console.error(
      `webpub: Content directory not found ${config.content_directory}`
    );
    process.exit(1);
  }

  start(config);
}

export async function main() {
  const configPath = join(process.cwd(), configFileName);
  if (existsSync(configPath)) {
    const configFile = await import(configPath);
  } else {
    // Run with default config or exit?
    console.error(
      `webpub: '${configFileName}' file not found. Using defaults.`
    );
    // process.exit(1);
    defineConfig(defaultOptions);
  }
}

async function start(config: WebpubConfig) {
  console.log("webpub: start()");
  // console.log("start() - config:", config);

  if (!config) {
    console.error("start: missing configuration");
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
