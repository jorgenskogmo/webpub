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
