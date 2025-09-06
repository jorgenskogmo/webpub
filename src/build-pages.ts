import { marked } from "marked";
import { join } from "node:path";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";

import {
	type Page,
	type WebpubConfig,
	type TreeNode,
	type RenderPage,
	WebpubHooks,
} from "./types.js";
import { copyDirSync } from "./utils.js";
import { buildTree } from "./build-tree.js";

export async function build_pages(config: WebpubConfig): Promise<void> {
	// todo: discuss,
	marked.setOptions(config.marked_options);

	let content: Record<string, Page> = {};
	const contentJsonPath = join(config.content_directory, "content.json");
	if (existsSync(contentJsonPath)) {
		const contentJson = readFileSync(contentJsonPath, "utf-8");
		// Safely parse to JSON
		try {
			content = JSON.parse(contentJson) as Record<string, Page>;
		} catch (e) {
			console.error("Failed to parse content.json:", e);
			process.exit(3);
		}
	}

	const buildPagesMessage = "Rebuilt all pages";
	console.time(buildPagesMessage);

	const tree = buildTree(content);
	console.log("tree:", tree);
	console.dir(tree, { depth: null });

	await walkAndBuild(tree, null, config);

	/*
	for (const [url, page] of Object.entries(content)) {
		console.log("\n+ Building page for URL:", url);

		// setup destination directory
		const dirPath = join(config.output_directory, url);
		const imagesDir = join(config.output_directory, url, "images");
		mkdirSync(imagesDir, { recursive: true });

		// convert markdown to html
		let html = await marked.parse(page.content);

		// process html with plugins
		for (const plugin of config.plugins) {
			if (plugin.hook === WebpubHooks.BUILD_PAGE) {
				html = await plugin.run(config, url, html);
			}
		}

		// render page with template
		// todo: determine which theme layout template to use
		const output = `${config.theme.render(config, {
			meta: page.meta,
			content: html,
		})}`;
		const outputPath = join(dirPath, "index.html");
		writeFileSync(outputPath, output);
	}
    */
	console.log("");
	console.timeEnd(buildPagesMessage);

	// copy static assets (e.g. images, stylesheets) to the output directory
	const copyAssetsMessage = `Copied assets from ${config.content_directory}/assets to ${config.output_directory}/assets`;
	console.time(copyAssetsMessage);
	copyDirSync(
		join(config.theme_directory, "assets"),
		join(config.output_directory, "assets"),
	);
	console.timeEnd(copyAssetsMessage);
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

async function walkAndBuild(
	node: TreeNode,
	parent: TreeNode | null,
	config: WebpubConfig,
) {
	console.log("\n+ Building page for URL:", node.url);

	const dirPath = join(config.output_directory, node.url);
	const imagesDir = join(dirPath, "images");
	mkdirSync(imagesDir, { recursive: true });

	// parse markdown → HTML for this node only
	let html = await marked.parse(node.page.content);

	// process plugins
	for (const plugin of config.plugins) {
		if (plugin.hook === WebpubHooks.BUILD_PAGE) {
			html = await plugin.run(config, node.url, html);
		}
	}

	// build lightweight children recursively
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

	console.log("currentPage:", currentPage);

	// render template
	const output = `${config.theme.render(config, currentPage)}`;
	const outputPath = join(dirPath, "index.html");
	writeFileSync(outputPath, output);

	// recurse into children
	for (const child of node.children) {
		await walkAndBuild(child, node, config);
	}
}
