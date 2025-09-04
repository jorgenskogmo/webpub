#!/usr/bin/env node
import path from "node:path";
import fs from "node:fs";

import { runBuild, startDevServer, startWatcher, setConfig } from "./dev.js";
import { cleanDestinationDirectory } from "./utils.js";

import type { WebpubConfig } from "./webpub.js";

import * as theme from "./defaults/templates/themes/default/index.js";
import * as srcsetPlugin from "./defaults/plugins/srcset/index.js";

// Get the root of the consuming project
const projectRoot = process.cwd();

// Build the path to webpub.config.json
const configPath = path.join(projectRoot, "webpub.config.json");

console.log("projectRoot:", projectRoot);
console.log("configPath:", configPath);

// Check if config file exists before reading
let config: WebpubConfig;
if (fs.existsSync(configPath)) {
  const configContent = fs.readFileSync(configPath, "utf-8");
  // Safely parse to JSON
  try {
    config = JSON.parse(configContent);
    config.theme = theme;
    config.plugins = [srcsetPlugin];
    config.devserver_port = config.devserver_port ?? 3001;
    config.content_directory = path.resolve(
      process.cwd(),
      config.content_directory
    );
    config.templates_directory = path.resolve(
      process.cwd(),
      config.templates_directory
    );
    config.output_directory = path.resolve(
      process.cwd(),
      config.output_directory
    );
  } catch (e) {
    console.error("Failed to parse config file as JSON:", e);
    process.exit(2);
  }
} else {
  console.error("Failed to read config file:", configPath);
  process.exit(1);
}

// const defaultConfig: WebpubConfig = {
//   name: "webpub default",
//   version: "0.0.1",
//   content_directory: "content",
//   templates_directory: "templates/themes/default",
//   output_directory: "site",
//   image_widths: [150, 300, 600, 1200],
//   theme,
//   plugins: [srcsetPlugin],
//   marked_options: { gfm: true, breaks: true },
//   open_browser: true,
//   devserver_port: 3000,
// };

// todo: add config flags?
// todo: find webpub.config.ts

async function main() {
  console.log("main");
  console.log("config:", config);

  setConfig(config);
  cleanDestinationDirectory(config); // optional?
  startWatcher();
  startDevServer();
  runBuild();
}

main();
