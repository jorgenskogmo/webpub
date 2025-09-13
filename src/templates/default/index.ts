import type { RenderPage, Template, WebpubConfig } from "../../types.js";

export const head = (config: WebpubConfig, _page: RenderPage) => `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${config.name} ${config.version}</title>
      <link rel="stylesheet" href="/assets/styles.css" />
      <!-- <link rel="stylesheet" href="/assets/webpub-bundle/entry.css" /> -->
      <script type="module" src="/assets/webpub-bundle/entry.js"></script>
    </head>
  `;

export const foot = (_config: WebpubConfig, _page: RenderPage) => `
  </body>
</html>`;

export const main = (config: WebpubConfig, page: RenderPage) => `
<body>
  <qdi-designsystem></qdi-designsystem>
  <div class="qdi-ds-layout-fixed">
    <header>
      <qdi-header>
        <span>
          QIAGEN Product Name
        </span>
        <div slot="end">
          <qdi-stack direction="horizontal" gap="2xl">
            <div><a href="#">Help</a></div>
            <div><a href="#">Login</a></div>
          </qdi-stack>
        </div>
      </qdi-header>
    </header>
    <main>
      <div class="content">

    <code>Local page (${config.name} ${config.version})</code>
    
    <h1>${page.meta.title}</h1>
    ${page.meta.date ? `<p class="small">date: ${page.meta.date}</p>` : ""}
    
    ${
			page.meta.modified
				? `<p class="small">modified: ${page.meta.modified}</p>`
				: ""
		}

    
    ${
			Array.isArray(page.meta?.tags) && page.meta.tags.length > 0
				? `<ul class="tags">${page.meta.tags
						.map((t) => `<li>${t}</li>`)
						.join("")}</ul>`
				: "notags"
		}
    

    <section class="content">${page.content}</section>

  </main>
    <footer>
      <qdi-footer>
        <div slot="version">alo Andrei</div>
      </qdi-footer>
    </footer>
  </div>
`;

export const render = (config: WebpubConfig, page: RenderPage) => {
	// console.log("@render:", page);
	return `${head(config, page)} ${main(config, page)} ${foot(config, page)}`;
};

export default { head, main, foot, render } as Template;
