import { html } from "lit-html";

const Special = () => {
  const count = Math.random();

  return html`
    <main>
      <h1>Count: ${count}</h1>
      <p>This is a client-side routed page using ds-router.</p>
      <p>Client-side routing capabilities allow you to:</p>
      <div class="features">
        <div>Navigate without page reloads</div>
        <div>Maintain application state</div>
        <div>Progressive enhancement</div>
      </div>
      <a href="/">← Back to Home</a>
    </main>
  `;
};

export default Special;
