# DS Router

A modern client-side router component built with LitElement for rendering route templates to the light DOM.

## Features

- 🚀 **Light DOM rendering** - No shadow DOM, integrates seamlessly with existing styles
- 📍 **Location observation** - Automatically responds to browser navigation (back/forward)
- 🔗 **Client-side navigation** - Intercepts link clicks for SPA-style navigation  
- 📁 **File-based routing** - Load route templates from files
- **Custom events** - Listen for route changes
- 💾 **Template caching** - Efficient route template loading
- 🔧 **Template variables** - Dynamic content with `${variable}` syntax
- ⚡ **LitElement-based** - Modern web component with `@property` decorators
- 🎯 **Error handling** - Custom 404/500 pages with fallbacks

## Basic Usage

```typescript
import './components/router/Router.js';
import { html, render } from 'lit-html';
import { RouteConfig } from './components/router/index.js';

const routes: RouteConfig[] = [
  { path: "/", templatePath: "/routes/home.thtml" },
  { path: "/about", templatePath: "/routes/about.thtml" },
];

const app = document.querySelector('#app');
render(html`<ds-router .routes=${routes}></ds-router>`, app);
```

## API

### Properties

#### `routes: RouteConfig[]`

The route configuration array. Use property binding to set routes:

```typescript
const routes: RouteConfig[] = [
  { path: "/", templatePath: "/routes/home.thtml" },
  { path: "/about", templatePath: "/routes/about.thtml" },
  // Component-based route with lit-html template
  { path: "/special", renderer: () => html`<h1>Dynamic Content: ${Date.now()}</h1>` },
  // Direct template result
  { path: "/static", renderer: html`<h1>Static lit-html content</h1>` },
];

// Set via property binding (recommended)
render(html`<ds-router .routes=${routes}></ds-router>`, app);

// Or set programmatically
const router = document.querySelector('ds-router');
router.routes = routes;
```

### Methods

#### `navigate(path: string, pushState?: boolean)`

Programmatically navigate to a route.

```typescript
const router = document.querySelector('ds-router');
router.navigate('/about'); // Navigate and update history
router.navigate('/about', false); // Navigate without updating history
```

#### `addRoute(path: string, config: Omit<RouteConfig, 'path'>)`

Add a new route dynamically. This updates the `routes` property and triggers reactivity.

```typescript
router.addRoute('/products', {
  templatePath: '/routes/products.thtml'
});

// Or with inline template
router.addRoute('/contact', {
  template: '<div><h1>Contact Us</h1></div>'
});
```

#### `removeRoute(path: string)`

Remove a route. This updates the `routes` property and triggers reactivity.

```typescript
router.removeRoute('/old-page');
```

#### `getCurrentPath(): string`

Get the current active route path.

```typescript
console.log(router.getCurrentPath()); // e.g., "/about"
```

#### `getRoutes(): RouteConfig[]`

Get all registered routes as an array.

```typescript
const routes = router.getRoutes();
console.log(routes.map(r => r.path)); // ["/", "/about", ...]
```

### Events

#### `route-changed`

Fired when the route changes.

```typescript
router.addEventListener('route-changed', (event) => {
  console.log('New route:', event.detail.path);
  console.log('Route config:', event.detail.route);
});
```

### Route Configuration

```typescript
interface RouteConfig {
  path: string;
  templatePath?: string;    // Path to template file
  renderer?: TemplateResult | (() => TemplateResult); // lit-html template or function
}
```

Routes can be configured in three ways:

1. **Template Path** - Load HTML from a file
2. **Renderer Function** - Use lit-html templates for dynamic content
3. **Direct Template** - Pass a lit-html TemplateResult directly

## Route Templates

Template files should contain HTML content that will be rendered into the router's target element:

```html
<!-- /public/routes/home.thtml -->
<div class="container">
  <nav>
    <a href="/">Home</a> |
    <a href="/about">About</a>
  </nav>
  <main>
    <h1>Welcome Home</h1>
    <p>This is the home page content.</p>
    <p>Current path: ${current_path}</p>
    <p>Loaded at: ${timestamp}</p>
    <button data-click="greet">Click me!</button>
  </main>
</div>
```

## Template Variables

All route templates support dynamic variables using `${variable_name}` syntax:

### Available in all templates

- `${current_path}` - The current route path
- `${timestamp}` - Current ISO timestamp when template was loaded

### Available in error templates

- `${requested_address}` - The path that was requested
- `${error}` - Error message (500 pages only)
- `${error_stack}` - Full error stack trace (500 pages only)

### Custom Error Pages

Create custom error pages that automatically load:

**404 Page (`/public/routes/404.html`):**

```html
<div class="container">
  <h1>404 - Page Not Found</h1>
  <p>The page <code>${requested_address}</code> doesn't exist.</p>
  <p>Error occurred at: ${timestamp}</p>
  <a href="/">← Back to Home</a>
</div>
```

**500 Page (`/public/routes/500.html`):**

```html
<div class="container">
  <h1>500 - Server Error</h1>
  <p>Error loading <code>${requested_address}</code></p>
  <details>
    <summary>Error Details</summary>
    <pre>${error}</pre>
  </details>
  <a href="/">← Back to Home</a>
</div>
```

## Event Handling

Use `data-click` attributes for interactive elements:

```html
<button data-click="greet">Greet</button>
```

The router automatically attaches event listeners for:

- `data-click="greet"` - Shows an alert dialog

You can extend this by modifying the `attachEventListeners()` method in the router.

## Directory Structure

```
src/
  components/
    router/
      Router.ts       # Main router component
      index.ts        # Exports
public/
  routes/
    home.thtml        # Home page template  
    about.thtml       # About page template
```

## Example Integration

```typescript
// main.ts
import './components/router/Router.js';
import { html, render } from 'lit-html';
import { RouteConfig } from './components/router/index.js';

const routes: RouteConfig[] = [
  { path: "/", templatePath: "/routes/home.thtml" },
  { path: "/about", templatePath: "/routes/about.thtml" },
  { path: "/contact", template: "<h1>Contact Us</h1><p>Email: hello@example.com</p>" },
];

const app = document.querySelector('#app');

// Render router with property binding
render(html`<ds-router .routes=${routes}></ds-router>`, app);

// Listen for route changes
const router = document.querySelector('ds-router');
router.addEventListener('route-changed', (event) => {
  document.title = `My App - ${event.detail.path}`;
  console.log('Navigated to:', event.detail.path);
});
```

## Directory Structure

```
src/
  components/
    router/
      Router.ts       # Main LitElement router component
      index.ts        # Exports
      README.md       # This documentation
  main.ts             # App entry point
public/
  routes/
    home.thtml        # Home page template  
    about.thtml       # About page template
    404.html          # Custom 404 page (optional)
    500.html          # Custom error page (optional)
```

## Browser Support

- Modern browsers with ES2020+ support
- Custom Elements v1
- Fetch API
- History API
- LitElement compatible browsers
