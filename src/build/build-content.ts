import { writeFileSync, readFileSync } from "fs";
import { join, relative, dirname, sep } from "path";
import { glob } from "glob";
import yaml from "js-yaml";

import type { Page } from "../webpub.ts";
import { config } from "../../webpub.config.ts";

function extractFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?/);
  if (match) {
    try {
      const frontmatter = yaml.load(match[1]) as { [key: string]: any };
      const markdown = content.slice(match[0].length);
      return { frontmatter, markdown };
    } catch (err) {
      return { frontmatter: {}, markdown: "" };
    }
  }
  return { frontmatter: {}, markdown: "" };
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

function buildStructure(contentDir: string): any {
  // Find all index.md and other files
  const indexFiles = glob.sync(join(contentDir, "**/index.md"));
  // console.log(indexFiles);

  const structure: Record<string, Page> = {};

  for (const file of indexFiles) {
    const rel = relative(contentDir, file);
    const pathArr = dirname(rel).split(sep).filter(Boolean);
    const url = `/${pathArr.join("/")}/`;

    console.log(rel, pathArr, url);
    const content = readFileSync(file, "utf8");
    const { frontmatter, markdown } = extractFrontmatter(content);

    structure[url] = { meta: frontmatter, content: markdown };
  }

  return sortKeys(structure);
}

const structure = buildStructure(config.content_directory);
const output_file = `${config.content_directory}/content.json`;
writeFileSync(output_file, JSON.stringify(structure, null, 2));
console.log(`Content structure written to ${output_file}`);
