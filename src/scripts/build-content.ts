import { writeFileSync, readdirSync, statSync, readFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

const CONTENT_DIR = "public/content";
const OUTPUT_FILE = "public/content.json";

function extractFrontmatter(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (match) {
    try {
      const frontmatter = yaml.load(match[1]);
      const content = markdown.slice(match[0].length);
      return { frontmatter, content };
    } catch (err) {
      return { frontmatter: {}, content: markdown };
    }
  }
  return { frontmatter: {}, content: markdown };
}

function sortKeys(obj: Record<string, any>): Record<string, any> {
  const keys = Object.keys(obj)
    .filter((k) => k !== "_data" && k !== "_files")
    .sort();
  const sorted: Record<string, any> = {};
  for (const k of keys) {
    sorted[k] =
      typeof obj[k] === "object" && obj[k] !== null && !Array.isArray(obj[k])
        ? sortKeys(obj[k])
        : obj[k];
  }
  if (obj["_files"]) sorted["_files"] = obj["_files"];
  if (obj["_data"]) sorted["_data"] = obj["_data"];
  return sorted;
}

function walkDir(dir: string): any {
  const result: Record<string, any> = {};
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      result[entry] = walkDir(fullPath);
    } else if (entry === "index.md") {
      // Precompute frontmatter and HTML for index.md
      const markdown = readFileSync(fullPath, "utf8");
      const { frontmatter, content } = extractFrontmatter(markdown);
      result["_data"] = {
        frontmatter,
        markdown: content,
      };
    } else {
      // Only include other files, not directories
      if (!result["_files"]) result["_files"] = [];
      result["_files"].push(entry);
    }
  }
  return sortKeys(result);
}

const structure = walkDir(CONTENT_DIR);
writeFileSync(OUTPUT_FILE, JSON.stringify(structure, null, 2));
console.log(`Content structure written to ${OUTPUT_FILE}`);
