import { join } from "node:path";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

import { runBuild, startDevServer, startWatcher, setConfig } from "./dev.js";
import { cleanDestinationDirectory } from "./utils.js";
import type { WebpubConfig, WebpubOptions } from "./types.js";
import { logger } from "./logger.js";

export * from "./types.js";
export * from "./logger.js";

import { imgPlugin } from "./plugins/img/index.js";

const CONFIG_FILENAME = "webpub.config.js";
const BUNLDE_FILENAME = "webpub-bundle-entry.ts";

logger.level = 3;

export async function defineConfig(userConfig?: WebpubOptions) {
	const packageFile = join(import.meta.dirname, "../package.json");
	const packageJson = JSON.parse(await readFile(packageFile, "utf-8"));

	const userPackageFile = join(process.cwd(), "package.json");
	const userPackage = JSON.parse(await readFile(userPackageFile, "utf-8"));

	const isDev = process.argv.includes("dev");

	const defaults: WebpubConfig = {
		name: userPackage.name || "webpub site",
		version: userPackage.version || "0.0.1",
		content_directory: "example/content",
		output_directory: "site",
		theme_directory: "src/templates/default", // TODO: Make this the default
		site: {},
		plugins: [imgPlugin],
		marked_options: { gfm: true, breaks: true },
		open_browser: true,
		devserver_enabled: isDev,
		devserver_port: 3000,
		webpub_version: packageJson.version || "0.0.1",
		webpub_isdev: isDev,
		webpub_bundle_filename: BUNLDE_FILENAME,
	};

	const config: WebpubConfig = Object.assign(defaults, userConfig || {});

	logger.info("Configuring build for", config.name, config.version);

	// FIXME: plugin incompatability handling should be WAY more robust
	// remove the default imgPlugin if srcsetPlugin is used
	if (config.plugins.filter((p) => p.name === "webpub/srcset").length > 1) {
		logger.info("webpub: srcsetPlugin detected in config, removing imgPlugin");
		config.plugins = config.plugins?.filter((p) => p !== imgPlugin);
	}

	logger.debug("webpub: plugins:", config.plugins);

	config.content_directory = join(process.cwd(), config.content_directory);
	config.output_directory = join(process.cwd(), config.output_directory);
	config.theme_directory = join(process.cwd(), config.theme_directory);

	if (!existsSync(config.content_directory)) {
		logger.error(
			`Content directory not found: '${config.content_directory}'. Exiting.`,
		);
		process.exit(1);
	}

	start(config);
}

// called by cli
export async function main() {
	const configPath = join(process.cwd(), CONFIG_FILENAME);
	if (existsSync(configPath)) {
		// config file found. The config file will call defineConfig, then start()
		await import(configPath);
	} else {
		// run with default config
		logger.warn(`'${CONFIG_FILENAME}' file not found. Using defaults.`);
		defineConfig();
	}
}

async function start(config: WebpubConfig) {
	logger.debug("webpub: start() config:", config);
	logger.start(`webpub v${config.webpub_version} starting`);

	if (!config) {
		logger.error("webpub.start: missing configuration. Exiting.");
		return;
	}

	setConfig(config);
	cleanDestinationDirectory(config);

	if (!config.devserver_enabled || !config.webpub_isdev) {
		logger.info("Running in build-only mode...");
		await runBuild();
		return;
	}

	startWatcher();
	startDevServer();

	setTimeout(() => {
		runBuild();
	}, 10);
}
