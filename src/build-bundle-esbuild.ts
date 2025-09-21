import { join, resolve } from "node:path";
import { existsSync } from "node:fs";

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
			// await import("vite");
			await import("esbuild");
		} catch (error) {
			console.error("Error during esbuild import:", error);
		}

		try {
			const { build, version } = await import("esbuild");

			timer.lapse("Create bundle", `using esbuild v${version}`);

			const result = await build({
				entryPoints: [bundleEntryPath], // your main entry
				outfile: join(
					config.output_directory,
					"assets",
					"webpub-bundle",
					"index.js",
				), // output file
				bundle: true, // concatenate deps into one file
				platform: "browser",
				target: "es2022", // set JS target
				// format: "esm", // or "cjs" for require()
				sourcemap: true, // optional
				minify: false, // optional
			});

			timer.end("Create bundle");
		} catch (error) {
			console.error("Error during Vite build:", error);
		}
	}
}
