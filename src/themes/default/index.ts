import type { RenderPage, Template, WebpubConfig } from "../../types.js";

export const head = (config: WebpubConfig, _page: RenderPage) => `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${config.name} ${config.version}</title>
      <link rel="stylesheet" href="/assets/styles.css" />
    </head>
  `;

export const foot = (_config: WebpubConfig, _page: RenderPage) => `
  </body>
</html>`;

export const main = (config: WebpubConfig, page: RenderPage) => `
<body>
  <main>
    <h1>Default page (${config.name} ${config.version})</h1>

    <code>${JSON.stringify(page.meta)}</code>
    
    <code>${JSON.stringify(page)}</code>
    
    

    <div>${page.content}</div>
  </main>
  <textarea style="display:none;" id="data-page">${JSON.stringify(page)}</textarea>
    <script>
      const txt = document.querySelector("#data-page").value.trim();
      // console.log("txt:", txt)
      console.log("page:", JSON.parse(txt))
    </script>
`;

export const render = (config: WebpubConfig, page: RenderPage) => {
	// console.log("@render:", page);
	return `${head(config, page)} ${main(config, page)} ${foot(config, page)}`;
};

export default { head, main, foot, render } as Template;
