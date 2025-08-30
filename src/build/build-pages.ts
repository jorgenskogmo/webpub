import { marked } from "marked";
import { join } from "node:path";
import { writeFileSync, mkdirSync } from "fs";

import { copyDirSync } from "../utils.ts";
import { config } from "../../webpub.config.ts";
import type { Page } from "../webpub.ts";
import { render } from "../../templates/default.ts"; // todo: dynamically import?

// todo: somehow autoregister plugins
import { srcset } from "../plugins/srcset/index.ts";

// todo: discuss,
// todo: expose in config?
marked.setOptions({
  gfm: true,
  breaks: true,
});

export async function build_pages(): Promise<void> {
  // dynamically import the generated content.json
  const content = (
    await import(`../../${config.content_directory}/content.json`)
  ).default as Record<string, Page>;

  // // clear output directory
  // // todo: DONT when in watch-mode
  // rmSync(config.output_directory, { recursive: true, force: true });
  // mkdirSync(config.output_directory, { recursive: true });

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
    html = await srcset(config, url, html);

    // todo: determine if the page.meta specifies a template to use
    // const template = page.meta.template || "default";

    const output = `${render({ meta: page.meta, content: html })}`;
    const outputPath = join(dirPath, `index.html`);
    writeFileSync(outputPath, output);
  }
  console.log("");
  console.timeEnd(buildPagesMessage);

  // copy static assets (e.g. images, stylesheets) to the output directory
  const copyAssetsMessage = `Copied assets from ${config.content_directory}/assets to ${config.output_directory}/assets`;
  console.time(copyAssetsMessage);
  copyDirSync(
    join(config.content_directory, "assets"),
    join(config.output_directory, "assets")
  );
  console.timeEnd(copyAssetsMessage);
}
