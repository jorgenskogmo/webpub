import { html } from "lit-html";
import { getPathContent, markdownToHtml } from "../lib/content-utils";

export default async function ProjectRenderer() {
  const { frontmatter, content } = await getPathContent();
  // You can use frontmatter here if needed
  console.log("Frontmatter:", frontmatter);
  return html`
    <main>
      ${markdownToHtml(content)}
      <a href="/">← Back to Home</a>
    </main>
  `;
}
