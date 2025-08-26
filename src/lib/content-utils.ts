import yaml from "js-yaml";
import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export interface FrontmatterResult {
  frontmatter: Record<string, any>;
  content: string;
}

export function extractFrontmatter(markdown: string): FrontmatterResult {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (match) {
    try {
      const frontmatter = yaml.load(match[1]) as Record<string, any>;
      const content = markdown.slice(match[0].length);
      return { frontmatter, content };
    } catch (err) {
      return { frontmatter: {}, content: markdown };
    }
  }
  return { frontmatter: {}, content: markdown };
}

export async function getMarkdownPathFromJson(
  path: string
): Promise<string | null> {
  try {
    const response = await fetch("/content.json");
    if (!response.ok) return null;
    const structure = await response.json();
    // path: /projects/aa
    const match = path.match(/^\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)$/);
    if (match) {
      const resource = match[1];
      const id = match[2];
      // Check if resource and id exist in structure
      if (structure[resource] && structure[resource][id]) {
        return `/content/${resource}/${id}/index.md`;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function getPathContent(): Promise<{
  frontmatter: Record<string, any>;
  content: string;
}> {
  const path = window.location.pathname;
  const match = path.match(/^\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)$/);
  let frontmatter: Record<string, any> = {};
  let markdown = "";
  let errorMsg = "";
  try {
    const response = await fetch("/content.json");
    if (!response.ok) throw new Error("Could not load content.json");
    const structure = await response.json();
    if (match) {
      const resource = match[1];
      const id = match[2];
      const data = structure[resource]?.[id]?._data;
      if (data) {
        frontmatter = data.frontmatter || {};
        markdown = data.markdown || "";
      } else {
        errorMsg = `No content found for ${path}`;
      }
    } else {
      errorMsg = "Invalid path format.";
    }
  } catch (err) {
    errorMsg = `Error loading content: ${String(err)}`;
  }
  if (errorMsg) {
    markdown = errorMsg;
  }
  return { frontmatter, content: markdownToHtml(markdown) };
}

export function markdownToHtml(md: string): string {
  // marked.parse may return a Promise in some configurations, but we expect sync usage here

  //   console.log("Converting markdown to HTML:", md);

  const result = marked.parse(md);
  //   console.log("Converting markdown to HTML result:", result);

  //   console.log(
  //     marked.parse(`
  // Hello

  // <qdi-button variant="primary">Go</qdi-button>
  // `)
  //   );

  if (typeof result === "string") return result;
  // If it's a Promise, this is unexpected in this context
  throw new Error("marked.parse returned a Promise; expected a string");
}
export async function getDirectoryContent(resource: string): Promise<string[]> {
  try {
    const response = await fetch("/content.json");
    if (!response.ok) return [];
    const structure = await response.json();
    // Get subdirectories for the resource
    const dirs = structure[resource]
      ? Object.keys(structure[resource]).filter((k) => k !== "_files")
      : [];
    return dirs;
  } catch {
    return [];
  }
}
