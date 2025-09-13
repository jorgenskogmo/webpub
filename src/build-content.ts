import { readFile } from "node:fs/promises";
import { join, relative, dirname, sep } from "node:path";
import { glob } from "glob";
import yaml from "js-yaml";

import type { Json, Page, WebpubConfig, ContentStructure } from "./types.js";

export async function build_content(
	config: WebpubConfig,
): Promise<ContentStructure> {
	console.log("+ Building content");
	console.time("Build content");

	// Find all index.md files in the content directory
	const indexFiles = glob.sync(join(config.content_directory, "**/index.md"));

	const structure: Record<string, Page> = {};

	for (const file of indexFiles) {
		const rel = relative(config.content_directory, file);
		const pathArr = dirname(rel).split(sep).filter(Boolean);
		const url = `/${pathArr.join("/")}/`;

		console.log("- indexing", rel);
		const content = await readFile(file, "utf8");
		const { frontmatter, markdown } = extractFrontmatter(content);

		structure[url] = { meta: frontmatter, content: markdown };
	}

	console.timeEnd("Build content");
	console.log(`Done. Indexed ${indexFiles.length} pages.`);

	return structure;
}

// utils --

function extractFrontmatter(content: string) {
	const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
	if (match) {
		try {
			const frontmatter = yaml.load(match[1]) as { [key: string]: Json };
			const markdown = content.slice(match[0].length);
			// TODO: Should we ensure frontmatter is typed? (that it contains a list of known keys?)
			return { frontmatter, markdown };
		} catch (err) {
			return { frontmatter: {}, markdown: "" };
		}
	}
	return { frontmatter: {}, markdown: "" };
}
