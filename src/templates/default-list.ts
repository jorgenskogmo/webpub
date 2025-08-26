// Fallback renderer for plural resources (list pages)
import { html } from "lit-html";
import { getDirectoryContent } from "../lib/content-utils";

export default async function DefaultListRenderer() {
  // Try to infer the resource from the current path
  const path = window.location.pathname;
  const match = path.match(/^\/([a-zA-Z0-9_-]+)$/);
  const resource = match ? match[1] : null;
  let items: string[] = [];
  if (resource) {
    items = await getDirectoryContent(resource);
  }
  return html`
    <main>
      <h2>List Page</h2>
      <ul>
        ${items.map(
          (item) => html`<li><a href="/${resource}/${item}">${item}</a></li>`
        )}
      </ul>
      <a href="/">← Back to Home</a>
    </main>
  `;
}
