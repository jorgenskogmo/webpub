#!/usr/bin/env node
import path from "path";
import fs from "fs";

import { runBuild, startDevServer, startWatcher, setConfig } from "./dev.js";
import { cleanDestinationDirectory } from "./utils.js";

import type { WebpubConfig } from "./webpub.js";

// Get the root of the consuming project
const projectRoot = process.cwd();

// Build the path to webpub.config.json
const configPath = path.join(projectRoot, "webpub.config.json");

console.log("projectRoot:", projectRoot);
console.log("configPath:", configPath);

import * as theme from "./defaults/templates/themes/default/index.js";
import * as srcsetPlugin from "./defaults/plugins/srcset/index.js";

const defaultConfig: WebpubConfig = {
  name: "webpub default",
  version: "0.0.1",
  content_directory: "content",
  templates_directory: "templates/themes/default",
  output_directory: "site",
  image_widths: [150, 300, 600, 1200],
  theme,
  plugins: [srcsetPlugin],
  marked_options: { gfm: true, breaks: true },
  open_browser: true,
  devserver_port: 3000,
};

console.log("Webpub CLI running…");

// todo: add config flags?
// todo: find webpub.config.ts

async function main() {
  console.log("main");
  const config = await import(configPath);
  console.log("config:", config);

  setConfig(defaultConfig);
  cleanDestinationDirectory(defaultConfig); // optional?
  startWatcher();
  startDevServer();
  runBuild();
}

main();
