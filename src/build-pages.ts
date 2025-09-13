import { marked } from "marked";
import { join, resolve } from "node:path";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";

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
	const buildPagesMessage = "Rebuilt all pages";
	console.time(buildPagesMessage);

	// (re)load rendering template
	console.log(">> Reloading theme from", config.theme_directory);
	const theme: Template = await import(
		join(config.theme_directory, `index.js?t=${Date.now()}`)
	);

	const tree = buildTree(content);
	const pageData = await walkAndBuild({}, tree, null, config, theme);

	console.log("");
	console.timeEnd(buildPagesMessage);

	await buildBundle(config);

	// copy static assets (e.g. images, stylesheets) to the output directory
	const copyAssetsMessage = `Copied assets from ${config.content_directory}/assets to ${config.output_directory}/assets`;
	console.time(copyAssetsMessage);
	copyDirSync(
		join(config.theme_directory, "assets"),
		join(config.output_directory, "assets"),
	);
	console.timeEnd(copyAssetsMessage);

	return pageData;
}

async function buildBundle(config: WebpubConfig) {
	// --- Vite build integration ---
	const bundleEntryPath = resolve(
		config.theme_directory,
		config.webpub_bundle_filename,
	);

	console.log("bundleEntryPath", bundleEntryPath);

	if (existsSync(bundleEntryPath)) {
		console.log(
			`>>> Found ${config.webpub_bundle_filename}, bundling with Vite...`,
		);
		try {
			const { version } = await import("vite");
			console.log("Vite", version, "imported successfully for bundling.");
		} catch (error) {
			console.error("Error during Vite import:", error);
		}

		try {
			const { build, defineConfig } = await import("vite");

			const viteConfig = defineConfig({
				root: config.theme_directory,
				mode: "production",
				base: "/",
				build: {
					outDir: `${config.output_directory}/assets/webpub-bundle`,
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

			console.log(
				"Starting Vite build with config:",
				viteConfig,
				"pwd:",
				process.cwd(),
			);

			await build(viteConfig);
		} catch (error) {
			console.error("Error during Vite build:", error);
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
	console.log("\n+ Building page for URL:", node.url);

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
