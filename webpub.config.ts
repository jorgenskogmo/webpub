import type { WebpubConfig } from "./src/webpub";

export const config: WebpubConfig = {
  name: "webpub demo",
  version: "0.0.1",
  content_directory: "content",
  templates_directory: "templates",
  output_directory: "dist",
  image_widths: [150, 300, 600, 1200],
};
