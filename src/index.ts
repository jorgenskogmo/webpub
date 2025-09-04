import { runBuild, startDevServer, startWatcher, setConfig } from "./dev.js";
import { cleanDestinationDirectory } from "./utils.js";
import { loadConfig } from "./configparser.js";
import type { WebpubConfig } from "./types.js";

export * from "./types.js";

export async function defineConfig(conf: WebpubConfig) {
  console.log("defineConfig called with", conf);
}

export async function main() {
  const config = await loadConfig();
  console.log("main called, loaded config:", config);

  setConfig(config);
  cleanDestinationDirectory(config);

  if (!config.devserver_enabled) {
    console.log("# Running in build-only mode...");
    await runBuild();
    return;
  }

  startWatcher();
  startDevServer();
  runBuild();
}

// main().catch((err) => {
//   console.error(err);
//   process.exit(1);
// });
