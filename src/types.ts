import type { MarkedOptions } from "marked";

export type WebpubConfig = {
  name: string;
  version: string;
  content_directory: string;
  template: string; // Consider using the Template type?
  templates_directory: string; //FIXME: sat by configParser and watched (so its kinda internal?)
  output_directory: string;
  image_widths: number[]; // FIXME: this is a srcset plugin config - should not be here
  theme: Template;
  plugins: Plugin[];
  marked_options: MarkedOptions;
  open_browser?: boolean;
  devserver_port?: number;
  devserver_enabled?: boolean;
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
