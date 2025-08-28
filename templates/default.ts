import { config } from "../webpub.config.ts";
import type { Page, Template } from "../src/webpub.ts";

export const head = (_page: Page) => `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${config.name} ${config.version}</title>
      <link rel="stylesheet" href="/assets/styles.css" />
    </head>
  `;

export const foot = (_page: Page) => `
  </body>
</html>`;

export const main = (page: Page) => `
<body>
  <main>
    <h1>Default page (${config.name} ${config.version})</h1>

    <code>${JSON.stringify(page.meta)}</code>

    <div>${page.content}</div>
  </main>
`;

export const render = (page: Page) =>
  `${head(page)} ${main(page)} ${foot(page)}`;

export default { head, main, foot, render } as Template;
