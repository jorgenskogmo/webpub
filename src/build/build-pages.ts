import { marked } from "marked";
import sharp from "sharp";
import {
  writeFileSync,
  mkdirSync,
  rmSync,
  readdirSync,
  statSync,
  copyFileSync,
  existsSync,
} from "fs";
import { basename, join } from "node:path";

import { config } from "../../webpub.config.ts";
import type { Page } from "../webpub.ts";
import { render } from "../../templates/default.ts"; // todo: dynamically import?

// todo: discuss,
// todo: expose in config?
marked.setOptions({
  gfm: true,
  breaks: true,
});

const IMAGE_REGEX_MARKDOWN = /!\[.*?\]\((?!https?:\/\/)(.*?)\)/g;
const IMAGE_REGEX_HTML = /<img[^>]+src=["']((?!https?:)[^"']+)["'][^>]*>/g;

export async function build_pages(): Promise<void> {
  // dynamically import the generated content.json
  const content = (
    await import(`../../${config.content_directory}/content.json`)
  ).default as Record<string, Page>;

  // clear output directory
  // todo: DONT when in watch-mode
  rmSync(config.output_directory, { recursive: true, force: true });
  mkdirSync(config.output_directory, { recursive: true });

  for (const [url, page] of Object.entries(content)) {
    console.log("\n+ building", url);

    // setup destination directory
    const dirPath = join(config.output_directory, url);
    const imagesDir = join(config.output_directory, url, "images");
    mkdirSync(imagesDir, { recursive: true });

    // grab all images (not ones addressed by http(s))
    const imagePaths = extractImages(page.content);
    console.log("imagePaths:", imagePaths);

    const imageMap: Record<string, string[]> = {}; // original -> resized versions
    for (const imgPath of imagePaths) {
      imageMap[imgPath] = [];
      const imageInputPath = join(config.content_directory, url, imgPath);

      for (const width of config.image_widths) {
        const resizedImageName = `w${width}-${basename(imgPath)}`;
        const resizedImagePath = join(imagesDir, resizedImageName);
        imageMap[imgPath].push(resizedImageName);

        // todo: consider a cache (imageOutputPath + checksum) to avoid reprocessing. For now, just use filename:
        if (!existsSync(resizedImagePath)) {
          // @see: https://sharp.pixelplumbing.com/api-resize/
          await sharp(imageInputPath)
            .resize(width) // width only, auto height.
            .toFile(resizedImagePath);
        }
      }
    }

    let html = await marked.parse(page.content);

    // compose src-sets for <img> elements using the resized images created above
    // todo: consider <picture> elements?
    // console.log("imageMap:", imageMap);
    const imgElements = html.match(/<img.*?\/?>/g);
    if (imgElements) {
      for (const imgTag of imgElements) {
        const attrs = extractImgAttrs(imgTag);
        if (!attrs.src || !imageMap[attrs.src]) continue;

        const srcImages = imageMap[attrs.src];
        const imgTagWithSrcSet = `<img \
        alt="${attrs.alt || "no alt text available"}" \
        src="images/${findEntryByPrefix("w150", srcImages)}" \
        srcset="${buildSourceSet(srcImages)}" />`;
        html = html.replace(imgTag, imgTagWithSrcSet);
      }
    }

    // todo: determine if the page.meta specifies a template to use
    // const template = page.meta.template || "default";

    const output = `${render({ meta: page.meta, content: html })}`;
    const outputPath = join(dirPath, `index.html`);
    writeFileSync(outputPath, output);
  }

  // copy static assets (e.g. images, stylesheets) to the output directory
  copyDirSync(
    join(config.content_directory, "assets"),
    join(config.output_directory, "assets")
  );
}

// utils --

function buildSourceSet(sources: string[]): string {
  return config.image_widths
    .map(
      (width) => `images/${findEntryByPrefix(`w${width}`, sources)} ${width}w`
    )
    .join(", ");
}

function findEntryByPrefix(prefix: string, arr: string[]): string | undefined {
  return arr.find((entry) => entry.startsWith(prefix));
}

function extractImgAttrs(imgTag: string): { src?: string; alt?: string } {
  const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
  const altMatch = imgTag.match(/alt=["']([^"']+)["']/);
  return {
    src: srcMatch ? srcMatch[1] : undefined,
    alt: altMatch ? altMatch[1] : undefined,
  };
}

function extractImages(markdown: string): string[] {
  // extract images provided with markdown notation
  const matches = [...markdown.matchAll(IMAGE_REGEX_MARKDOWN)];
  const sources: string[] = matches.map((match) => match[1]);
  // extract images provided with html notation
  let match: RegExpExecArray | null;
  while ((match = IMAGE_REGEX_HTML.exec(markdown)) !== null) {
    sources.push(match[1]);
  }
  return sources;
}

function copyDirSync(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

await build_pages();
