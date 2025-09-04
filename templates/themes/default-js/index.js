export const head = (config, page) => `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${config.name} ${config.version}</title>
      <link rel="stylesheet" href="/assets/styles.css" />
    </head>
  `;

export const foot = (_config, page) => `
  </body>
</html>`;

export const main = (config, page) => `
<body>
  <main>
    <h1>Default page (${config.name} ${config.version})</h1>

    <code>${JSON.stringify(page.meta)}</code>

    <div>${page.content}</div>
  </main>
`;

export const render = (config, page) =>
  `${head(config, page)} ${main(config, page)} ${foot(config, page)}`;

export default { head, main, foot, render };
