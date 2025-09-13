import { join, resolve } from "node:path";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";

import { marked } from "marked";
import stripAnsi from "strip-ansi";

import { logger } from "./logger";

import {
	type WebpubConfig,
	type TreeNode,
	type RenderPage,
	type UrlPageMap,
	type Template,
	WebpubHooks,
	type ContentStructure,
} from "./types.js";
import { copyDirSync } from "./utils.js";
import { buildTree } from "./build-tree.js";

export async function build_pages(
	config: WebpubConfig,
	content: ContentStructure,
): Promise<UrlPageMap> {
	// todo: discuss,
	marked.setOptions(config.marked_options);

	// start rebuild timer
	const buildPagesMessage = "Generate pages";
	console.time(buildPagesMessage);

	const tree = buildTree(content);

	// (re)load rendering template
	logger.start("+ Reloading templates");
	logger.debug("Reloading templates from:", config.theme_directory);
	const theme: Template = await import(
		join(config.theme_directory, `index.js?t=${Date.now()}`)
	);

	logger.start("+ Generating pages");
	const pageData = await walkAndBuild({}, tree, null, config, theme);

	console.timeEnd(buildPagesMessage);
	logger.success("Generated", Object.keys(pageData).length, "pages.");

	await buildBundle(config);

	// copy static assets (e.g. images, stylesheets) to the output directory
	console.log("");
	logger.start("+ Copying static assets");
	logger.debug(
		`Copied assets from ${config.content_directory}/assets to ${config.output_directory}/assets`,
	);
	if (logger.level > 3) console.time("Copy static assets");
	copyDirSync(
		join(config.theme_directory, "assets"),
		join(config.output_directory, "assets"),
	);
	if (logger.level > 3) console.timeEnd("Copy static assets");
	logger.success("Copy assets");

	return pageData;
}

async function buildBundle(config: WebpubConfig) {
	const bundleEntryPath = resolve(
		config.theme_directory,
		config.webpub_bundle_filename,
	);

	logger.debug("Checking Project content for bundle entry:", bundleEntryPath);

	if (existsSync(bundleEntryPath)) {
		logger.debug("Project needs bundling. Attempting to load Vite");
		try {
			await import("vite");
		} catch (error) {
			logger.error("Error during Vite import:", error);
		}

		try {
			const { build, defineConfig, version } = await import("vite");

			console.log("");
			console.time("Vite build");
			logger.start(`+ Bundling with Vite v${version}`);

			const viteConfig = defineConfig({
				logLevel: "info",

				customLogger: {
					hasWarned: false,
					info(msg, opts) {
						if (msg.includes("built in")) {
							const clean = stripAnsi(msg); // ✓ built in 35ms
							const time = clean.match(/built in (\d+ms)/);
							const timeStr = time ? time[1] : "";
							logger.success(`Bundle built in ${timeStr}`);
						}
						if (msg.includes("gzip")) {
							logger.info("+", msg.replaceAll("../", "").trim());
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

			logger.debug(
				"+ Starting Vite build with config:",
				viteConfig,
				"pwd:",
				process.cwd(),
			);

			await build(viteConfig);
			console.timeEnd("Vite build");
		} catch (error) {
			logger.error("Error during Vite build:", error);
		}
	}
}

async function walkAndBuild(
	pageData: UrlPageMap,
	node: TreeNode,
	parent: TreeNode | null,
	config: WebpubConfig,
	theme: Template,
) {
	logger.info("- building page for URL:", node.url);

	// Create the directory for the current page
	const dirPath = join(config.output_directory, node.url);
	mkdirSync(dirPath, { recursive: true });

	// parse markdown → HTML
	let html = await marked.parse(node.page.content);

	// create images directory if the page contains images
	if (html.match(/<img[^>]+src=["']((?!https?:)[^"']+)["'][^>]*>/g)) {
		const imagesDir = join(dirPath, "images");
		if (!existsSync(imagesDir)) {
			mkdirSync(imagesDir, { recursive: true });
		}
	}

	// Process plugins
	for (const plugin of config.plugins) {
		if (plugin.hook === WebpubHooks.BUILD_PAGE) {
			html = await plugin.run(config, node.url, html);
		}
	}

	// Build lightweight children recursively
	const childrenLite: RenderPage[] = node.children.map((child) =>
		toLiteNode(child, node.url),
	);

	// current page, with parsed HTML
	const currentPage: RenderPage = {
		url: node.url,
		meta: node.page.meta,
		content: html,
		type: node.type,
		parent: parent ? parent.url : null,
		children: childrenLite,
	};

	pageData[node.url] = currentPage;

	// render template
	const output = `${theme.render(config, currentPage)}`;
	const outputPath = join(dirPath, "index.html");
	writeFileSync(outputPath, output);

	// recurse into children
	for (const child of node.children) {
		await walkAndBuild(pageData, child, node, config, theme);
	}

	return pageData;
}

function toLiteNode(node: TreeNode, parent: string | null): RenderPage {
	return {
		url: node.url,
		meta: node.page.meta,
		content: "", // strip markdown/HTML
		type: node.type,
		parent,
		children: node.children.map((child) => toLiteNode(child, node.url)),
	};
}
