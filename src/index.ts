import { join } from "node:path";
import { existsSync } from "node:fs";

import { runBuild, startDevServer, startWatcher, setConfig } from "./dev.js";
import { cleanDestinationDirectory } from "./utils.js";
import type { WebpubConfig, WebpubOptions } from "./types.js";

export * from "./types.js";

import * as defaultTheme from "./themes/default/index.js";
import * as srcsetPlugin from "./plugins/srcset/index.js";

const configFileName = "webpub.config.ts";
const dirname = import.meta.dirname;
console.log("dirname:", dirname);
console.log("import.meta.url:", import.meta.url);
console.log("import.meta:", import.meta);

const defaultOptions: WebpubConfig = {
  name: "webpub default",
  version: "0.0.1",
  content_directory: join(process.cwd(), "content"),
  output_directory: join(process.cwd(), "site"),

  theme: defaultTheme,
  theme_directory: join(import.meta.dirname, "themes/default"),
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
  const configPath = join(process.cwd(), "xx", configFileName);
  if (existsSync(configPath)) {
    await import(configPath);
  } else {
    console.error(
      `webpub: '${configFileName}' file not found. Using defaults.`
    );
    console.log("1-defaultOptions:", defaultOptions);
    defaultOptions.theme_directory = join(
      import.meta.dirname,
      "themes/default"
    );
    defaultOptions.theme = await import(
      join(import.meta.dirname, "themes/default/index.js")
    );
    console.log("2-defaultOptions:", defaultOptions);

    // TODO: Run with default config or exit?
    // process.exit(1);
    defineConfig(defaultOptions);
  }
}

async function start(config: WebpubConfig) {
  console.log("webpub: start()");

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
