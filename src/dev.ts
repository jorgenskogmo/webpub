import { watch } from "fs";
import { join } from "path";
import { spawn } from "child_process";
import { ServerWebSocket } from "bun";

import { config } from "../webpub.config";
import { build_content } from "./build/build-content";
import { build_pages } from "./build/build-pages";

let buildTimeout: NodeJS.Timeout | null = null;
let buildInProgress = false;
let buildCompletedAt = Date.now();
const sockets: Set<ServerWebSocket<unknown>> = new Set();

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

export async function runBuild(): Promise<void> {
  if (buildInProgress) {
    console.log("Build already running, skipping...");
    return;
  }
  buildInProgress = true;

  try {
    console.time("Rebuild");
    console.log("# Running build_content");
    await build_content();

    console.log("\n# Running build_pages");
    await build_pages();

    console.timeEnd("Rebuild");
    console.log("\n# Build complete. Reloading clients...\n");
    for (const ws of sockets) {
      try {
        ws.send("reload");
      } catch {
        sockets.delete(ws);
      }
    }
  } catch (err) {
    console.error("# **Build failed** :", err);
  } finally {
    buildInProgress = false;
    buildCompletedAt = Date.now();
  }
}

function scheduleBuild(): void {
  if (buildTimeout) clearTimeout(buildTimeout);
  buildTimeout = setTimeout(runBuild, 300);
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

function injectReloadSnippet(html: string): string {
  if (html.includes("</body>")) {
    return html.replace("</body>", `${LIVE_RELOAD_SNIPPET}</body>`);
  }
  return html + LIVE_RELOAD_SNIPPET;
}

async function handleRequest(
  req: Request,
  server: Bun.Server
): Promise<Response | undefined> {
  const url = new URL(req.url);

  if (url.pathname === "/livereload") {
    const success = server.upgrade(req, { data: {} });
    if (!success) return new Response("Upgrade failed", { status: 400 });
    return;
  }

  const path = join(config.output_directory, decodeURIComponent(url.pathname));
  try {
    const file = Bun.file(path);
    if (await file.exists()) {
      if (path.endsWith(".html")) {
        let html = await file.text();
        html = injectReloadSnippet(html);
        return new Response(html, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      }
      return new Response(file);
    }

    const indexFile = Bun.file(join(path, "index.html"));
    if (await indexFile.exists()) {
      let html = await indexFile.text();
      html = injectReloadSnippet(html);
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    return new Response("Not Found", { status: 404 });
  } catch {
    return new Response("Not Found", { status: 404 });
  }
}

export function startDevServer(): void {
  const server = Bun.serve({
    port: 3000,
    fetch: handleRequest,
    websocket: {
      open(ws: ServerWebSocket<unknown>) {
        sockets.add(ws);
      },
      close(ws: ServerWebSocket<unknown>) {
        sockets.delete(ws);
      },
      message(_ws: ServerWebSocket<unknown>, _msg: string | Buffer) {
        // no-op: we don’t handle client messages
      },
    },
  });

  console.log(`Dev server running at http://localhost:${server.port}`);
  openBrowser(`http://localhost:${server.port}`);
}

function openBrowser(url: string): void {
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
