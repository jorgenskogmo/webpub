import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { marked } from "marked";
// import sharp from "sharp";

import { config } from "../../webpub.config.ts";
import type { Page } from "../webpub.ts";
import content from "../../content/content.json"; // ideally a dynamic import
import { render } from "../../templates/default.ts";

marked.setOptions({
  gfm: true,
  breaks: true,
});

const imageRegex = /!\[.*?\]\((?!https?:\/\/)(.*?)\)/g;

async function buildPages(content: Record<string, Page>) {
  // clear output directory
  rmSync(config.output_directory, { recursive: true, force: true });
  mkdirSync(config.output_directory, { recursive: true });

  for (const [url, page] of Object.entries(content)) {
    console.log("+ building", url);

    // setup destination directory
    const dirPath = join(config.output_directory, url);
    const imagesDir = join(config.output_directory, url, "images");
    mkdirSync(imagesDir, { recursive: true });

    // grab all images (not ones addressed by http(s))
    const matches = [...page.content.matchAll(imageRegex)];
    const imagePaths = matches.map((match) => match[1]);
    console.log("imagePaths:", imagePaths);

    // for (const imgPath of imagePaths) {
    //   const inputPath = resolve("images", imgPath); // adjust path
    //   const outputPath = resolve("resized", imgPath);
    //   await sharp(inputPath)
    //     .resize(300) // width only, auto height
    //     .toFile(outputPath);
    //   console.log(`Resized: ${imgPath}`);
    // }

    const html = await marked.parse(page.content);
    const output = `${render({ meta: page.meta, content: html })}`;
    const outputPath = join(dirPath, `index.html`);
    writeFileSync(outputPath, output);
  }
}

buildPages(content);
