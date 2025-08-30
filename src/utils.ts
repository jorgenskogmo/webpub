import { join } from "node:path";
import { mkdirSync, rmSync, readdirSync, statSync, copyFileSync } from "fs";

import { config } from "../webpub.config.ts";

// clear output directory
export function cleanDestinationDirectory() {
  rmSync(config.output_directory, { recursive: true, force: true });
  mkdirSync(config.output_directory, { recursive: true });
  console.log("Output directory cleaned");
}

// recursively copies a directory
export function copyDirSync(src: string, dest: string) {
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
