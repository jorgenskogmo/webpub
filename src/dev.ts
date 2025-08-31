import { watch } from "fs";
import { join } from "path";
import { createServer } from "http";
import { readFile, stat } from "fs/promises";
import { WebSocketServer, WebSocket } from "ws";

import type { WebpubConfig } from "./webpub.js";
import { build_content } from "./build-content.js";
import { build_pages } from "./build-pages.js";
import { openBrowser } from "./utils.js";

let config: WebpubConfig;
let buildTimeout: NodeJS.Timeout | null = null;
let buildInProgress = false;
let buildCompletedAt = Date.now();
const sockets: Set<WebSocket> = new Set();

const LIVE_RELOAD_SNIPPET = `
<script>
  (() => {
    const ws = new WebSocket("ws://" + location.host + "/livereload");
    ws.onmessage = (e) => {
      if (e.data === "reload") location.reload();
    };
  })();
</script>
`;

export function setConfig(_config: WebpubConfig) {
  config = _config;
}

export async function runBuild(): Promise<void> {
  if (buildInProgress) {
    console.log("Build already running, skipping...");
    return;
  }
  buildInProgress = true;

  try {
    console.time("Rebuild");
    console.log("# Running build_content");
    await build_content(config);

    console.log("\n# Running build_pages");
    await build_pages(config);

    console.timeEnd("Rebuild");
    console.log("\n# Build complete.");

    if (config.devserver_enabled) {
      console.log("# Reloading clients...\n");
      for (const ws of sockets) {
        try {
          ws.send("reload");
        } catch {
          sockets.delete(ws);
        }
      }
    }
  } catch (err) {
    console.error("# **Build failed** :", err);
  } finally {
    buildInProgress = false;
    buildCompletedAt = Date.now();
  }
}

export function startWatcher(): void {
  const dirs = [config.content_directory, config.templates_directory];
  for (const dir of dirs) {
    watch(dir, { recursive: true }, (eventType, filename) => {
      const lapse = Date.now() - buildCompletedAt;
      if (lapse < 50 || filename?.includes("DS_Store")) {
        console.log(
          `% ${eventType}: ${filename ?? ""} -> ignored (time: ${lapse})`
        );
      } else {
        console.log(`% ${eventType}: ${filename ?? ""} -> rebuild`);
        scheduleBuild();
      }
    });
    console.log(`Watching ${dir} for changes...`);
  }
}

export function startDevServer(): void {
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    if (url.pathname === "/livereload") {
      // WebSocket upgrade is handled separately by ws
      res.writeHead(426, { "Content-Type": "text/plain" });
      res.end("Upgrade required");
      return;
    }

    const path = join(
      config.output_directory,
      decodeURIComponent(url.pathname)
    );

    try {
      let filePath = path;
      let stats = await stat(filePath);

      if (stats.isDirectory()) {
        // Redirect /docs -> /docs/
        if (!url.pathname.endsWith("/")) {
          res.writeHead(301, { Location: url.pathname + "/" });
          res.end();
          return;
        }

        // Serve index.html
        filePath = join(filePath, "index.html");
        stats = await stat(filePath);
      }

      if (stats.isFile()) {
        const content = await readFile(filePath);
        const contentType = getContentType(filePath);

        if (filePath.endsWith(".html")) {
          let html = content.toString("utf8");
          html = injectReloadSnippet(html);
          res.writeHead(200, { "Content-Type": contentType });
          res.end(html);
          return;
        }

        res.writeHead(200, { "Content-Type": contentType });
        res.end(content);
        return;
      }

      res.writeHead(404);
      res.end("Not Found");
    } catch {
      res.writeHead(404);
      res.end("Not Found");
    }
  });

  // attach websocket server
  const wss = new WebSocketServer({ noServer: true });
  wss.on("connection", (ws) => {
    sockets.add(ws);
    ws.on("close", () => sockets.delete(ws));
  });

  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
    if (url.pathname === "/livereload") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(config.devserver_port, () => {
    console.log(
      `# Dev server running at http://localhost:${config.devserver_port}`
    );
    if (config.open_browser) {
      console.log(`# Opening browser...`);
      openBrowser(`http://localhost:${config.devserver_port}`);
    }
  });
}

//

function scheduleBuild(): void {
  if (buildTimeout) clearTimeout(buildTimeout);
  buildTimeout = setTimeout(runBuild, 300);
}

function injectReloadSnippet(html: string): string {
  if (!config.devserver_enabled) return html;

  if (html.includes("</body>")) {
    return html.replace("</body>", `${LIVE_RELOAD_SNIPPET}</body>`);
  }
  return html + LIVE_RELOAD_SNIPPET;
}

function getContentType(filePath: string): string {
  const ext = filePath.toLowerCase();
  if (ext.endsWith(".html")) return "text/html; charset=utf-8";
  if (ext.endsWith(".css")) return "text/css; charset=utf-8";
  if (ext.endsWith(".js")) return "application/javascript; charset=utf-8";
  if (ext.endsWith(".json")) return "application/json; charset=utf-8";
  if (ext.endsWith(".svg")) return "image/svg+xml";
  if (ext.endsWith(".png")) return "image/png";
  if (ext.endsWith(".jpg") || ext.endsWith(".jpeg")) return "image/jpeg";
  if (ext.endsWith(".gif")) return "image/gif";
  if (ext.endsWith(".woff")) return "font/woff";
  if (ext.endsWith(".woff2")) return "font/woff2";
  if (ext.endsWith(".ttf")) return "font/ttf";
  return "application/octet-stream";
}
