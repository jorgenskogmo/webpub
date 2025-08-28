type TWebpubConfig = {
  name: string;
  version: string;
  content_directory: string;
  templates_directory: string;
  output_directory: string;
};

export const config: TWebpubConfig = {
  name: "webpub demo",
  version: "0.0.1",
  content_directory: "content",
  templates_directory: "templates",
  output_directory: "dist",
};
