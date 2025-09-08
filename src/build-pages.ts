import { marked } from "marked";
import { join } from "node:path";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";

import {
	type Page,
	type WebpubConfig,
	type TreeNode,
	type RenderPage,
	type UrlPageMap,
	WebpubHooks,
} from "./types.js";
import { copyDirSync } from "./utils.js";
import { buildTree } from "./build-tree.js";

export async function build_pages(config: WebpubConfig): Promise<UrlPageMap> {
	// todo: discuss,
	marked.setOptions(config.marked_options);

	// load content from json store
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

	// start rebuild timer
	const buildPagesMessage = "Rebuilt all pages";
	console.time(buildPagesMessage);

	// (re)load rendering template
	console.log(">> Reloading theme from", config.theme_directory);
	config.theme = await import(
		join(config.theme_directory, `index.js?t=${Date.now()}`)
	);

	const tree = buildTree(content);
	const pageData = await walkAndBuild({}, tree, null, config);

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

	return pageData;
}

async function walkAndBuild(
	pageData: UrlPageMap,
	node: TreeNode,
	parent: TreeNode | null,
	config: WebpubConfig,
) {
	console.log("\n+ Building page for URL:", node.url);

	const dirPath = join(config.output_directory, node.url);
	const imagesDir = join(dirPath, "images");
	mkdirSync(imagesDir, { recursive: true });

	// parse markdown → HTML
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

	// console.log("currentPage:", currentPage);
	pageData[node.url] = currentPage;

	// render template
	const output = `${config.theme.render(config, currentPage)}`;
	const outputPath = join(dirPath, "index.html");
	writeFileSync(outputPath, output);

	// recurse into children
	for (const child of node.children) {
		await walkAndBuild(pageData, child, node, config);
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
