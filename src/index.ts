import { runBuild, startDevServer, startWatcher, setConfig } from "./dev.js";
import { cleanDestinationDirectory } from "./utils.js";
import { loadConfig } from "./configparser.js";

async function main() {
  const config = await loadConfig();
  console.log("webpub config:", config);

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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
