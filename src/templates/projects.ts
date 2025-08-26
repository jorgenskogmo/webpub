import { html } from "lit-html";
import { getDirectoryContent } from "../lib/content-utils";

export default async function ProjectsRenderer() {
  const projects = await getDirectoryContent("projects");
  return html`
    <main>
      <h1>Projects</h1>
      <ul>
        ${projects.map(
          (project) =>
            html`<li><a href="/projects/${project}">${project}</a></li>`
        )}
      </ul>
      <a href="/">← Back to Home</a>
    </main>
  `;
}
