import type { MarkedOptions } from "marked";

// public:
export type WebpubOptions = {
  name: string;
  version: string;
  content_directory: string;
  output_directory: string;

  // has defaults:
  theme?: Template;
  theme_directory?: string;
  plugins?: Plugin[];
  image_widths?: number[];

  // optional:
  marked_options?: MarkedOptions;
  open_browser?: boolean;
  devserver_port?: number;
  devserver_enabled?: boolean;
};

// internal:
export type WebpubConfig = WebpubOptions & {
  theme: Template;
  theme_directory: string;
  plugins: Plugin[];
  image_widths: number[];

  marked_options: MarkedOptions;
  open_browser: boolean;
  devserver_port: number;
  devserver_enabled: boolean;
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
