import type { Page, TreeNode, ContentStructure } from "./types.js";

import { logger } from "./logger.js";

export function buildTree(content: ContentStructure): TreeNode {
	console.log("");
	logger.start("+ Building tree");

	const rootPage = content["/./"];
	if (!rootPage) {
		logger.error('Root page "/./" is missing in content');
	}

	const urls = Object.keys(content);

	function getParentPath(path: string): string | null {
		if (path === "/./") return null;
		const parts = path.split("/").filter(Boolean);
		if (parts.length === 0) return "/./";
		parts.pop();
		return parts.length > 0 ? `/${parts.join("/")}/` : "/./";
	}

	const nodes = new Map<string, TreeNode>();
	for (const [url, page] of Object.entries(content)) {
		nodes.set(url, { url, page, type: "detail", children: [] });
	}

	for (const url of urls) {
		const parent = getParentPath(url);
		const child = nodes.get(url);
		const parentNode = parent ? nodes.get(parent) : undefined;

		if (child && parentNode) {
			parentNode.children.push(child);
			parentNode.type = "list";
		}
	}

	const root = nodes.get("/./");
	if (!root) {
		throw new Error('Root node "/./" not found after building tree');
	}
	root.type = "list"; // ensure root is marked list

	return root;
}
