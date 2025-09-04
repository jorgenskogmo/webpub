import { join } from "node:path";
import { spawn } from "child_process";
import {
  mkdirSync,
  rmSync,
  readdirSync,
  statSync,
  copyFileSync,
} from "node:fs";

import type { WebpubConfig } from "./types.js";

// clear output directory
export function cleanDestinationDirectory(config: WebpubConfig) {
  rmSync(config.output_directory, { recursive: true, force: true });
  mkdirSync(config.output_directory, { recursive: true });
  console.log("# Output directory cleaned");
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

export function openBrowser(url: string): void {
  const platform = process.platform;
  let cmd: string;
  let args: string[];

  if (platform === "darwin") {
    cmd = "open";
    args = [url];
  } else if (platform === "win32") {
    cmd = "cmd";
    args = ["/c", "start", url];
  } else {
    cmd = "xdg-open";
    args = [url];
  }

  spawn(cmd, args, { stdio: "ignore", detached: true }).unref();
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
