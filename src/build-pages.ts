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
  ContentStructure,
} from "./types.js";
import { copyDirSync } from "./utils.js";
import { buildTree } from "./build-tree.js";

export async function build_pages(
  config: WebpubConfig,
  content: ContentStructure
): Promise<UrlPageMap> {
  // todo: discuss,
  marked.setOptions(config.marked_options);

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
    join(config.output_directory, "assets")
  );
  console.timeEnd(copyAssetsMessage);

  return pageData;
}

async function walkAndBuild(
  pageData: UrlPageMap,
  node: TreeNode,
  parent: TreeNode | null,
  config: WebpubConfig
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
    toLiteNode(child, node.url)
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

  // --- Vite build integration ---
  const viteConfigPath = join(process.cwd(), "vite.config.ts");
  if (existsSync(viteConfigPath)) {
    console.log(
      ">>> Detected vite.config.ts in project root, running Vite build asynchronously..."
    );
    const { exec } = await import("node:child_process");
    await new Promise((resolve, reject) => {
      exec(
        `npx vite build --config ${viteConfigPath}`,
        {},
        (error: Error | null, stdout: string, stderr: string) => {
          if (error) {
            console.error("Vite build failed:", error);
            reject(error);
          } else {
            resolve(stdout);
          }
        }
      );
    });
  }

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
