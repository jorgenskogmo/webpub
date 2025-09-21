import { resolve } from "node:path";
import { existsSync } from "node:fs";

import { stripAnsi } from "./utils/ansi-strip.js";
import { timer } from "./utils/timer/timer.js";

import type { WebpubConfig } from "./types.js";

export async function buildBundle(config: WebpubConfig) {
	const bundleEntryPath = resolve(
		config.theme_directory,
		config.webpub_bundle_filename,
	);

	console.log("");
	timer.start("Create bundle");
	if (existsSync(bundleEntryPath)) {
		// console.debug("Project needs bundling. Attempting to load Vite");
		try {
			await import("vite");
		} catch (error) {
			console.error("Error during Vite import:", error);
		}

		try {
			const { build, defineConfig, version } = await import("vite");

			timer.lapse("Create bundle", `using Vite v${version}`);

			const viteConfig = defineConfig({
				logLevel: "info",

				customLogger: {
					hasWarned: false,
					info(msg, opts) {
						if (msg.includes("built in")) {
							const clean = stripAnsi(msg); // ✓ built in 35ms
							const time = clean.match(/built in (\d+ms)/);
							const timeStr = time ? time[1] : "";
							timer.lapse("Create bundle", `Vite: Bundle built in ${timeStr}`);
						}
						if (msg.includes("gzip")) {
							timer.lapse("Create bundle", msg.replaceAll("../", "").trim());
						}
						// suppress others
					},
					warn(msg, opts) {
						console.warn("⚠️", msg);
					},
					error(msg, opts) {
						console.error("❌", msg);
					},
					warnOnce(msg) {
						console.warn("⚠️ once", msg);
					},
					clearScreen(type) {
						// disable screen clearing
					},
					hasErrorLogged(error) {
						return false;
					},
				},
				root: config.theme_directory,
				mode: "production",
				base: "/",
				build: {
					outDir: `${config.output_directory}/assets/webpub-bundle`,
					emptyOutDir: true,
					minify: "esbuild",
					rollupOptions: {
						input: bundleEntryPath,
						output: {
							entryFileNames: "index.js",
							assetFileNames: "[name].[ext]",
						},
					},
				},
			});

			// console.debug(
			// 	"+ Starting Vite build with config:",
			// 	viteConfig,
			// 	"pwd:",
			// 	process.cwd(),
			// );

			await build(viteConfig);
			timer.end("Create bundle");
		} catch (error) {
			console.error("Error during Vite build:", error);
		}
	}
}
