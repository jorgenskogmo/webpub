import { html } from "lit-html";

// import "@qdi/design-system/components/button";

const Components = () => {
  const count = Math.random();

  return html`
    <main>
      <h1>Components: ${count}</h1>
      <qdi-button variant="primary" @click=${() => alert("Button clicked!")}
        >QDI Button</qdi-button
      >
      <br />
      <a href="/">← Back to Home</a>
    </main>
  `;
};

export default Components;
