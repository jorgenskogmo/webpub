import type { Page, Template, WebpubConfig } from "../../../src/webpub.js";

export const head = (config: WebpubConfig, _page: Page) => `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${config.name} ${config.version}</title>
      <link rel="stylesheet" href="/assets/styles.css" />
    </head>
  `;

export const foot = (_config: WebpubConfig, _page: Page) => `
  </body>
</html>`;

export const main = (config: WebpubConfig, page: Page) => `
<body>
  <main>
    <h1>Default page (${config.name} ${config.version})</h1>

    <code>${JSON.stringify(page.meta)}</code>

    <div>${page.content}</div>
  </main>
`;

export const render = (config: WebpubConfig, page: Page) =>
  `${head(config, page)} ${main(config, page)} ${foot(config, page)}`;

export default { head, main, foot, render } as Template;
