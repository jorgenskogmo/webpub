import { startDevServer, startWatcher } from "./dev";

export type WebpubConfig = {
  name: string;
  version: string;
  content_directory: string;
  templates_directory: string;
  output_directory: string;
  image_widths: number[];
};

export type TemplateFunction = (page: Page) => string;

export type Template = {
  head: TemplateFunction;
  main: TemplateFunction;
  foot: TemplateFunction;
  render: TemplateFunction;
};

export type Page = {
  meta: {
    [key: string]: any;
  };
  content: string;
};

// main:

startWatcher();
startDevServer();
