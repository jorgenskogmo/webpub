import type { Page, TreeNode } from "./types.js";

export function buildTree(content: Record<string, Page>): TreeNode {
	const rootPage = content["/./"];
	if (!rootPage) {
		throw new Error('Root page "/./" is missing in content');
	}

	const root: TreeNode = {
		url: "/./",
		page: rootPage,
		type: "list",
		children: [],
	};

	const urls = Object.keys(content);

	function getParentPath(path: string): string | null {
		if (path === "/./") return null;
		const parts = path.split("/").filter(Boolean);
		if (parts.length === 0) return "/./"; // direct child of root
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

	return root;
}
