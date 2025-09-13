import type { MarkedOptions } from "marked";

// public:
export type WebpubOptions = {
	name?: string;
	version?: string;

	content_directory?: string;
	output_directory?: string;
	theme_directory?: string;

	plugins?: Plugin[];

	marked_options?: MarkedOptions;
	open_browser?: boolean;
	devserver_port?: number;
	devserver_enabled?: boolean;

	// arbitrary data that plugins or themes can use
	// e.g. user provided site-wide metadata
	site?: Json;
};

// internal:
export type WebpubConfig = WebpubOptions & {
	name: string;
	version: string;

	content_directory: string;
	output_directory: string;
	theme_directory: string;

	plugins: Plugin[];

	marked_options: MarkedOptions;
	open_browser: boolean;
	devserver_port: number;
	devserver_enabled: boolean;

	webpub_version: string;
	webpub_isdev: boolean;
	webpub_bundle_filename: string;
};

// todo: consider adding pre-, at- and post- hooks to both Page and Content loops
export enum WebpubHooks {
	BUILD_PAGE = 0,
	BUILD_CONTENT = 1, // not used
}

export type PluginFunction = (
	config: WebpubConfig,
	url: string,
	html: string,
) => Promise<string>;

export type Plugin<TConfig = unknown> = {
	name: string;
	hook: WebpubHooks;
	run: PluginFunction;
	configure: (opts: Partial<TConfig>) => void;
};

export type TemplateFunction = (
	config: WebpubConfig,
	page: RenderPage,
) => string;

export type Template = {
	head: TemplateFunction;
	main: TemplateFunction;
	foot: TemplateFunction;
	render: TemplateFunction;
};

export type ContentStructure = Record<string, Page>;

export type Json =
	| string
	| number
	| boolean
	| null
	| Json[]
	| { [key: string]: Json };

export type Page = {
	meta: { [key: string]: Json };
	content: string;
};

export type TreeNode = {
	url: string;
	page: Page;
	type: "list" | "detail";
	children: TreeNode[];
};

export type RenderPage = {
	url: string;
	meta: { [key: string]: Json };
	content: string;
	type: "list" | "detail";
	children: RenderPage[]; // full objects
	parent: string | null;
};

export type UrlPageMap = { [key: string]: RenderPage };
