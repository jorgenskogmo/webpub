import { join, resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";

import type { WebpubConfig } from "./types.js";
import * as srcsetPlugin from "./plugins/srcset/index.js";

export const loadConfig = async (): Promise<WebpubConfig> => {
  const args = process.argv.slice(2);
  const buildOnly = args.includes("--build-only");

  // Get the root of the consuming project
  const projectRoot = process.cwd();

  // Build the path to webpub.config.json
  const configPath = join(projectRoot, "webpub.config.json");

  console.log("projectRoot:", projectRoot);
  console.log("configPath:", configPath);

  if (!existsSync(configPath)) {
    console.error("Failed to read config file:", configPath);
    process.exit(1);
  }

  let config: WebpubConfig;
  const configContent = readFileSync(configPath, "utf-8");
  try {
    config = JSON.parse(configContent);
  } catch (e) {
    console.error("Failed to parse config file as JSON:", e);
    process.exit(2);
  }

  config.devserver_enabled = buildOnly ? false : true;
  config.devserver_port = config.devserver_port ?? 3001;

  config.output_directory = resolve(process.cwd(), config.output_directory);
  config.content_directory = resolve(process.cwd(), config.content_directory);
  config.templates_directory = resolve(process.cwd(), config.template);

  // load templates
  const templateFile = resolve(config.templates_directory, "index.js");
  console.log("templateFile:", templateFile);
  if (existsSync(templateFile)) {
    config.theme = await import(templateFile);
  } else {
    console.error("Failed to read theme file:", templateFile);
    process.exit(1);
  }

  // todo: load plugins
  config.plugins = [srcsetPlugin];

  return config;
};
