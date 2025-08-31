import { marked } from "marked";
import { join } from "node:path";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "fs";

import { copyDirSync } from "./utils.js";
import { type Page, type WebpubConfig, WebpubHooks } from "./webpub.js";

export async function build_pages(config: WebpubConfig): Promise<void> {
  // todo: discuss,
  marked.setOptions(config.marked_options);

  // dynamically import the generated content.json
  // const content = (await import(join(config.content_directory, "content.json")))
  //   .default as Record<string, Page>;

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

  const buildPagesMessage = `Rebuilt all pages`;
  console.time(buildPagesMessage);
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
    const outputPath = join(dirPath, `index.html`);
    writeFileSync(outputPath, output);
  }
  console.log("");
  console.timeEnd(buildPagesMessage);

  // copy static assets (e.g. images, stylesheets) to the output directory
  const copyAssetsMessage = `Copied assets from ${config.content_directory}/assets to ${config.output_directory}/assets`;
  console.time(copyAssetsMessage);
  copyDirSync(
    join(config.templates_directory, "assets"),
    join(config.output_directory, "assets")
  );
  console.timeEnd(copyAssetsMessage);
}
