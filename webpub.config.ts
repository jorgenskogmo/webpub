import type { WebpubConfig } from "./src/webpub.js";

import * as theme from "./templates/themes/default/index.js";
import * as srcsetPlugin from "./plugins/srcset/index.js";

export const config: WebpubConfig = {
  name: "webpub demo",
  version: "0.0.1",
  content_directory: "content",
  templates_directory: "templates",
  output_directory: "site",
  image_widths: [150, 300, 600, 1200],
  theme,
  plugins: [srcsetPlugin],
  marked_options: { gfm: true, breaks: true },
  open_browser: true,
  devserver_port: 3000,
};
