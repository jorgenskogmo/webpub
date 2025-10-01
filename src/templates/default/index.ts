import type { RenderPage, Template, TemplateParams } from "../../types.js";

const render_head = ({ config, page, site }: TemplateParams) => `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${config.name} ${config.version}</title>
      <link rel="stylesheet" href="/assets/styles.css" />
      <!-- <link rel="stylesheet" href="/assets/webpub-bundle/entry.css" /> -->
      <script type="module" src="/assets/webpub-bundle/index.js"></script>
    </head>

    <body>

    <nav>
      <a href="/">Home</a> |
      ${
				site.children
					?.map(
						(child) =>
							`<a href="${child.url}">${
								(child.page?.meta as { title?: string })?.title ?? "Untitled"
							} (${child.url})</a>\n`,
					)
					.join(" | ") ?? ""
			}
    </nav>
    <!-- @webpub: end-head -->
  `;

const render_footer = ({ config, page, site }: TemplateParams) => {
	const { content, ...data } = page;
	const dataStr = JSON.stringify(data);

	return `
  
  <script>
  // show available data in the console
	  console.log("page*:", ${dataStr});
    console.log("site:", ${JSON.stringify(site)});
    console.log("config:", ${JSON.stringify(config)});
  </script>

  </body>
</html>`;
};

const render_project = ({ config, page, site }: TemplateParams) => `

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

const render_front = ({ config, page, site }: TemplateParams) => `
  <main>
    <code>render_front</code>
    <section class="content">${page.content}</section>
  </main>
`;

const render_list = ({ config, page, site }: TemplateParams) => `
  <main>
    <code>render_list</code>
    <section class="content">${page.content}</section>

    <ul>${list(page)}</ul>
  </main>
`;

const render_default = ({ config, page, site }: TemplateParams) => `
  <main>
    <code>render_default</code>

    ${
			Array.isArray(page.meta?.tags) && page.meta.tags.length > 0
				? `<ul class="tags">${page.meta.tags
						.map((t) => `<li>${t}</li>`)
						.join("")}</ul>`
				: "notags"
		}

    <section class="content">${page.content}</section>
  </main>
`;

export const render = (input: TemplateParams) => {
	const { config, page, site } = input;

	let html = render_head(input);

	if (page.url === "/./") {
		html += render_front(input);
	} else if (page.type === "list") {
		html += render_list(input);
	} else if (page.url.startsWith("/projects/")) {
		html += render_project(input);
	} else {
		// default
		html += render_default(input);
	}

	html += render_footer(input);

	return html;
};

// utils, could be moved to a separate file?
const list = (page: RenderPage) => {
	return page.children
		.map((child) => {
			return `<li><a href="${child.url}">${child.meta.title} (${child.url})</a></li>\n`;
		})
		.join("");
};

export default { render } as Template;
