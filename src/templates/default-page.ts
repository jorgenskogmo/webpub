import { html } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { getPathContent, markdownToHtml } from "../lib/content-utils";

export default async function DefaultPageRenderer() {
  const { frontmatter, markdown } = await getPathContent();
  // You can use frontmatter here if needed
  console.log("Frontmatter:", frontmatter);
  return html`
    <main>
      <h2>Detail Page</h2>
      ${unsafeHTML(markdownToHtml(markdown))}
      <a href="/">← Back to Home</a>
    </main>
  `;
}
