import "@qdi/design-system";
import "@qdi/design-system/index.css";
import "./components/router/Router";
import "./style.css";

import Special from "./pages/special";
import Components from "./pages/components";

import { RouteConfig } from "./components/router/index";
import { html, render } from "lit-html";

const routes: RouteConfig[] = [
  { path: "/", templatePath: "/routes/home.thtml" },
  { path: "/about", templatePath: "/routes/about.thtml" },
  // Test route that will cause a 500 error (invalid template path)
  { path: "/test-error", templatePath: "/routes/nonexistent-file.html" },
  { path: "/function", renderer: Special },
  { path: "/components", renderer: Components },
];

console.log("Routes config:", routes);

const titleFormatter = (route: RouteConfig) =>
  `Lit Site - ${route.path === "/" ? "Home" : route.path.replace("/", "")}`;

// Main application entry point
const app = document.querySelector<HTMLDivElement>("#app")!;

render(
  html`
    <ds-router .routes=${routes} .titleFormatter=${titleFormatter}></ds-router>
  `,
  app
);

console.log("🚀 Lit Site initialized with ds-router using property binding");
