import { mkdirSync, rmSync } from "node:fs";

import type { WebpubConfig } from "../types.js";

export function cleanDestinationDirectory(config: WebpubConfig) {
	rmSync(config.output_directory, { recursive: true, force: true });
	mkdirSync(config.output_directory, { recursive: true });
	console.log(`Emptied '${config.output_directory}' directory`);
}
