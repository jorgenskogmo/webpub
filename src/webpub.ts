import { MarkedOptions } from "marked";

export type WebpubConfig = {
  name: string;
  version: string;
  content_directory: string;
  templates_directory: string;
  output_directory: string;
  image_widths: number[];
  theme: Template;
  plugins: Plugin[];
  marked_options: MarkedOptions;
  open_browser: true;
  devserver_port: number;
};

// todo: consider adding pre-, at- and post- hooks to both Page and Content loops
export enum WebpubHooks {
  BUILD_PAGE,
  BUILD_CONTENT, // not used
}

export type PluginFunction = (
  config: WebpubConfig,
  url: string,
  html: string
) => Promise<string>;

export type Plugin = {
  hook: WebpubHooks;
  run: PluginFunction;
};

export type TemplateFunction = (config: WebpubConfig, page: Page) => string;

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
