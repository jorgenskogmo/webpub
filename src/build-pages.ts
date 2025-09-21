import { join } from "node:path";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";

import { marked } from "marked";

import { timer } from "./utils/timer/timer.js";
import { buildBundle } from "./build-bundle.js";

import {
	type WebpubConfig,
	type TreeNode,
	type RenderPage,
	type UrlPageMap,
	type Template,
	type ContentStructure,
	type TemplateParams,
	type SimpleTreeNode,
	WebpubHooks,
} from "./types.js";
import { copyDirSync } from "./utils/copy-dir.js";
import { buildTree } from "./build-tree.js";

export async function build_pages(
	config: WebpubConfig,
	content: ContentStructure,
): Promise<UrlPageMap> {
	// todo: discuss,
	marked.setOptions(config.marked_options);

	// start rebuild timer
	console.log("");
	timer.start("Generate pages");

	// build tree from content structure
	const tree = buildTree(content);

	// a copy of the tree without content
	const simpleTree = removeContentDeep(tree);
	timer.lapse("Generate pages", "buildt tree");

	// (re)load rendering template
	const theme: Template = await import(
		join(config.theme_directory, `index.js?t=${Date.now()}`)
	);
	timer.lapse("Generate pages", "reloaded templates");

	const pageData = await walkAndBuild(
		simpleTree,
		{},
		tree,
		null,
		config,
		theme,
	);
	timer.end(
		"Generate pages",
		`generated ${Object.keys(pageData).length} pages.`,
	);

	await buildBundle(config);

	// copy static assets (e.g. images, stylesheets) to the output directory
	console.log("");
	timer.start("Copying static assets");
	// console.debug(`Copied assets from ${config.content_directory}/assets to ${config.output_directory}/assets`);
	copyDirSync(
		join(config.theme_directory, "assets"),
		join(config.output_directory, "assets"),
	);
	timer.end("Copying static assets");

	return pageData;
}

async function walkAndBuild(
	site: SimpleTreeNode,
	pageData: UrlPageMap,
	node: TreeNode,
	parent: TreeNode | null,
	config: WebpubConfig,
	theme: Template,
) {
	timer.lapse("Generate pages", `building page for URL: ${node.url}`);

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
	const params: TemplateParams = {
		config,
		page: currentPage,
		site,
	};
	const output = `${theme.render(params)}`;
	const outputPath = join(dirPath, "index.html");
	writeFileSync(outputPath, output);

	// recurse into children
	for (const child of node.children) {
		await walkAndBuild(site, pageData, child, node, config, theme);
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

function removeContentDeep(node: SimpleTreeNode): SimpleTreeNode {
	// make a shallow copy
	const copy: SimpleTreeNode = { ...node };

	if (copy.page && "content" in copy.page) {
		const { content, ...rest } = copy.page;
		copy.page = rest;
	}

	if (copy.children) {
		copy.children = copy.children.map(removeContentDeep);
	}

	return copy;
}
