import type { MarkedOptions } from "marked";

// public:
export type WebpubOptions = {
	name: string;
	version: string;
	content_directory: string;
	output_directory: string;
	template_directory: string;

	// has defaults:
	theme?: Template;
	theme_directory?: string;
	plugins?: Plugin[];

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

	marked_options: MarkedOptions;
	open_browser: boolean;
	devserver_port: number;
	devserver_enabled: boolean;
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
