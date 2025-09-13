import { existsSync } from "node:fs";
import { basename, join } from "node:path";

import sharp from "sharp";

import {
	type WebpubConfig,
	type Plugin,
	WebpubHooks,
	logger,
} from "../../index.js";

const PLUGIN_NAME = "webpub/img";
const PLUGIN_COMPLETE_MESSAGE = `${PLUGIN_NAME} plugin complete`;
const IMAGE_REGEX_HTML = /<img[^>]+src=["']((?!https?:)[^"']+)["'][^>]*>/g;

export const hook = WebpubHooks.BUILD_PAGE;

export type imgOptions = {
	image_widths: number[];
};

const options: imgOptions = {
	image_widths: [1200],
};

export const configure = (opts: Partial<imgOptions>) => {
	Object.assign(options, opts);
};

export const run = async (
	config: WebpubConfig,
	url: string,
	html: string,
): Promise<string> => {
	// console.log(`- plugin:${PLUGIN_NAME}, processing url:`, url);
	if (logger.level > 3)
		logger.info(`- plugin:${PLUGIN_NAME}, processing url:`, url);
	if (logger.level > 3) console.time(PLUGIN_COMPLETE_MESSAGE);
	const imgElements = html.match(IMAGE_REGEX_HTML);

	let newHtml = html;

	if (imgElements) {
		const imagesDir = join(config.output_directory, url, "images");
		for (const imgTag of imgElements) {
			const attrs = extractImgAttrs(imgTag);
			if (attrs.src) {
				const imageMap: Record<string, string[]> = {}; // original -> resized versions
				imageMap[attrs.src] = [];
				const srcImages = imageMap[attrs.src];
				for (const width of options.image_widths) {
					const resizedImageName = `w${width}-${basename(attrs.src)}`;
					const resizedImagePath = join(imagesDir, resizedImageName);
					const imageInputPath = join(config.content_directory, url, attrs.src);
					srcImages.push(resizedImageName);

					// todo: consider a cache (imageOutputPath + checksum) to avoid reprocessing. For now, just use filename:
					if (!existsSync(resizedImagePath)) {
						logger.debug("-- creating", resizedImagePath);
						// @see: https://sharp.pixelplumbing.com/api-resize/
						await sharp(imageInputPath)
							.resize(width) // width only, auto height.
							.toFile(resizedImagePath);
					}
				}

				const imgTagWithSrcSet = `<img \
            alt="${attrs.alt || "no alt text available"}" \
            src="images/${findEntryByPrefix("w1200", srcImages)}" />`;

				newHtml = newHtml.replace(imgTag, imgTagWithSrcSet);
			}
		}
	}

	if (logger.level > 3) console.timeEnd(PLUGIN_COMPLETE_MESSAGE);
	return newHtml;
};

function extractImgAttrs(imgTag: string): { src?: string; alt?: string } {
	const srcMatch = imgTag.match(/src=["']([^"']+)["']/);
	const altMatch = imgTag.match(/alt=["']([^"']+)["']/);
	return {
		src: srcMatch ? srcMatch[1] : undefined,
		alt: altMatch ? altMatch[1] : undefined,
	};
}

function findEntryByPrefix(prefix: string, arr: string[]): string | undefined {
	return arr.find((entry) => entry.startsWith(prefix));
}

export const imgPlugin: Plugin<imgOptions> = {
	name: PLUGIN_NAME,
	hook,
	run,
	configure,
};
