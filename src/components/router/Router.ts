import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { TemplateResult, render, html } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";
import { renderers } from "../../templates/index";
import { markdownToHtml } from "../../lib/content-utils";

export interface RouteConfig {
  path: string;
  templatePath?: string;
  renderer?: TemplateResult | (() => TemplateResult);
}

export type TitleFormatter = (route: RouteConfig) => string;

@customElement("ds-router")
export class Router extends LitElement {
  @property({ type: Array })
  declare routes: RouteConfig[];

  @property({ attribute: false })
  declare titleFormatter?: TitleFormatter;

  private routesMap: Map<string, RouteConfig> = new Map();
  private currentPath: string = "";
  private routeCache: Map<string, string> = new Map();

  protected createRenderRoot() {
    // Return the element itself to render to light DOM
    return this;
  }

  constructor() {
    super();
    // Do not assign this.titleFormatter here; let Lit handle it
    // Bind methods to preserve context
    this.handlePopState = this.handlePopState.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  protected updated(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has("routes")) {
      this.initializeRoutes();
      // Re-render current route if already connected
      if (this.isConnected) {
        this.navigate(window.location.pathname);
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();

    // Initialize routes from configuration
    this.initializeRoutes();

    // Listen for popstate events (back/forward navigation)
    window.addEventListener("popstate", this.handlePopState);

    // Listen for click events to handle client-side navigation
    document.addEventListener("click", this.handleClick);

    // Render initial route
    this.navigate(window.location.pathname);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("popstate", this.handlePopState);
    document.removeEventListener("click", this.handleClick);
  }

  private initializeRoutes() {
    // Clear existing routes
    this.routesMap.clear();

    // Add routes from configuration
    this.routes.forEach((route: RouteConfig) => {
      this.routesMap.set(this.normalizePath(route.path), route);
    });
  }
  private handlePopState(_event: PopStateEvent) {
    this.navigate(window.location.pathname, false);
  }

  private handleClick(event: Event) {
    const target = event.target as HTMLElement;
    const link = target.closest("a[href]") as HTMLAnchorElement;

    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    // Only handle internal links
    if (href.startsWith("http") || href.startsWith("//")) return;

    // Normalize path
    const normalizedPath = this.normalizePath(href);

    // Check if we have a route for this path
    let shouldIntercept = this.routesMap.has(normalizedPath);

    // Also intercept dynamic plural/singular routes
    if (!shouldIntercept) {
      const pluralMatch = normalizedPath.match(/^\/([a-zA-Z0-9_-]+)$/);
      const singularMatch = normalizedPath.match(
        /^\/([a-zA-Z0-9_-]+)\/[^\/]+$/
      );
      if (pluralMatch || singularMatch) {
        shouldIntercept = true;
      }
    }

    if (shouldIntercept) {
      event.preventDefault();
      this.navigate(normalizedPath);
    }
  }

  private normalizePath(path: string): string {
    // Remove trailing slashes and normalize paths
    if (path === "/") return "/";
    return path.replace(/\/$/, "");
  }

  public async navigate(path: string, pushState: boolean = true) {
    const normalizedPath = this.normalizePath(path);

    if (this.currentPath === normalizedPath) return;

    const route = this.routesMap.get(normalizedPath);
    if (!route) {
      // --- Barrel file renderer lookup ---
      // Match /resource (plural)
      const pluralMatch = normalizedPath.match(/^\/([a-zA-Z0-9_-]+)$/);
      if (pluralMatch) {
        const resource = pluralMatch[1];
        const renderer =
          (renderers as Record<string, any>)[resource] || renderers.defaultList;
        const dynamicRoute: RouteConfig = { path: normalizedPath, renderer };
        if (dynamicRoute.renderer) {
          if (pushState && normalizedPath !== window.location.pathname) {
            window.history.pushState({}, "", normalizedPath);
          }
          // Ensure location is updated before rendering
          this.currentPath = normalizedPath;
          await this.renderWithFunction(
            dynamicRoute.renderer as
              | TemplateResult
              | (() => TemplateResult | Promise<TemplateResult>)
          );
          this.dispatchEvent(
            new CustomEvent("route-changed", {
              detail: { path: normalizedPath, route: dynamicRoute },
              bubbles: true,
            })
          );
          return;
        } else {
          await this.renderError(
            new Error(`No renderer found for ${normalizedPath}`)
          );
          return;
        }
      }
      // Match /resource/:id (singular)
      const singularMatch = normalizedPath.match(
        /^\/([a-zA-Z0-9_-]+)\/([^\/]+)$/
      );
      if (singularMatch) {
        const resource = singularMatch[1];
        const id = singularMatch[2];
        // Check content.json for existence
        try {
          const response = await fetch("/content.json");
          if (response.ok) {
            const structure = await response.json();
            if (structure[resource] && structure[resource][id]) {
              const singular = resource.endsWith("s")
                ? resource.slice(0, -1)
                : resource;
              const renderer =
                (renderers as Record<string, any>)[singular] ||
                renderers.defaultPage;
              const dynamicRoute: RouteConfig = {
                path: normalizedPath,
                renderer,
              };
              if (dynamicRoute.renderer) {
                if (pushState && normalizedPath !== window.location.pathname) {
                  window.history.pushState({}, "", normalizedPath);
                }
                this.currentPath = normalizedPath;
                // Always use markdown rendering for singular dynamic routes
                const response = await fetch("/content.json");
                const structure = await response.json();
                const data = structure[resource]?.[id]?._data;
                let htmlContent = "";
                if (data && data.markdown) {
                  htmlContent = markdownToHtml(data.markdown);
                }
                const template = html`${unsafeHTML(htmlContent)}`;
                render(template, this);
                this.attachEventListeners();
                this.dispatchEvent(
                  new CustomEvent("route-changed", {
                    detail: { path: normalizedPath, route: dynamicRoute },
                    bubbles: true,
                  })
                );
                return;
              } else {
                await this.renderError(
                  new Error(`No renderer found for ${normalizedPath}`)
                );
                return;
              }
            }
          }
        } catch {}
        // If not found, fall through to not found
      }
      // --- End barrel file renderer lookup ---
      console.warn(`No route found for path: ${normalizedPath}`);
      await this.renderNotFound();
      return;
    }

    try {
      if (route.renderer) {
        await this.renderWithFunction(route.renderer);
      } else if (route.templatePath) {
        // Handle template path
        const content = await this.loadRouteContent(route);
        this.renderContent(content);
      } else {
        throw new Error("Route has no renderer or templatePath defined");
      }

      // Update document title
      if (this.titleFormatter) {
        document.title = this.titleFormatter(route);
      } else {
        document.title = route.path;
      }

      if (pushState && normalizedPath !== window.location.pathname) {
        window.history.pushState({}, "", normalizedPath);
      }

      this.currentPath = normalizedPath;

      // Dispatch custom event for route changes
      this.dispatchEvent(
        new CustomEvent("route-changed", {
          detail: { path: normalizedPath, route },
          bubbles: true,
        })
      );
    } catch (error) {
      console.error(`Failed to load route ${normalizedPath}:`, error);
      await this.renderError(error as Error);
    }
  }

  private async loadRouteContent(route: RouteConfig): Promise<string> {
    if (route.templatePath) {
      // Check cache first
      if (this.routeCache.has(route.templatePath)) {
        return this.routeCache.get(route.templatePath)!;
      }

      try {
        const response = await fetch(route.templatePath);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch template: ${response.status} ${response.statusText}`
          );
        }

        const content = await response.text();
        this.routeCache.set(route.templatePath, content);
        return content;
      } catch (error) {
        throw new Error(
          `Failed to load template from ${route.templatePath}: ${error}`
        );
      }
    }

    throw new Error("Route has no templatePath defined");
  }

  private renderContent(content: string) {
    // Process template variables before rendering
    const processedContent = this.processTemplateVariables(content, {
      current_path: this.currentPath,
      timestamp: new Date().toISOString(),
    });

    // Use lit-html render to render the content to this element (same as renderer routes)
    // Create a template from the processed content
    const template = html`${unsafeHTML(processedContent)}`;
    render(template, this);

    // Re-attach event listeners for dynamic content
    this.attachEventListeners();
  }

  private async renderWithFunction(
    renderer: TemplateResult | (() => TemplateResult | Promise<TemplateResult>)
  ) {
    try {
      let template: TemplateResult | Promise<TemplateResult>;
      if (typeof renderer === "function") {
        template = renderer();
        if (template instanceof Promise) {
          template = await template;
        }
      } else {
        template = renderer;
      }
      render(template, this);
      this.attachEventListeners();
    } catch (error) {
      console.error("Failed to render with function:", error);
      this.renderError(new Error("Failed to render component"));
    }
  }

  private processTemplateVariables(
    content: string,
    variables: Record<string, string>
  ): string {
    let processedContent = content;

    // Process all provided variables
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\$\\{${key}\\}`, "g");
      processedContent = processedContent.replace(regex, value);
    }

    return processedContent;
  }

  private async renderNotFound() {
    try {
      // Try to load custom 404 page
      const response = await fetch("/routes/404.html");
      if (response.ok) {
        const content = await response.text();
        const processedContent = this.processTemplateVariables(content, {
          requested_address: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
        const template = html`${unsafeHTML(processedContent)}`;
        render(template, this);
        this.attachEventListeners();
        // Set document title for 404
        if (this.titleFormatter) {
          document.title = this.titleFormatter({ path: "/404" });
        } else {
          document.title = "404 - Not Found";
        }
        return;
      }
    } catch (error) {
      // Fall through to default 404
    }

    // Default 404 page
    const template = html`
      <div class="container">
        <main>
          <h1>404 - Page Not Found</h1>
          <p>
            The page <code>${window.location.pathname}</code> doesn't exist.
          </p>
          <a href="/">← Back to Home</a>
        </main>
      </div>
    `;
    render(template, this);
    // Set document title for 404
    if (this.titleFormatter) {
      document.title = this.titleFormatter({ path: "/404" });
    } else {
      document.title = "404 - Not Found";
    }
  }

  private async renderError(error: Error) {
    try {
      // Try to load custom 500 page
      const response = await fetch("/routes/500.html");
      if (response.ok) {
        const content = await response.text();
        const processedContent = this.processTemplateVariables(content, {
          error: error.message,
          error_stack: error.stack || "No stack trace available",
          requested_address: window.location.pathname,
          timestamp: new Date().toISOString(),
        });
        const template = html`${unsafeHTML(processedContent)}`;
        render(template, this);
        this.attachEventListeners();
        // Set document title for 500
        if (this.titleFormatter) {
          document.title = this.titleFormatter({ path: "/500" });
        } else {
          document.title = "500 - Error";
        }
        return;
      }
    } catch (fetchError) {
      // Fall through to default error page
    }

    // Default error page
    const template = html`
      <div class="container">
        <main>
          <h1>Error</h1>
          <p>An error occurred while loading the page:</p>
          <pre>${error.message}</pre>
          <a href="/">← Back to Home</a>
        </main>
      </div>
    `;
    render(template, this);
    // Set document title for 500
    if (this.titleFormatter) {
      document.title = this.titleFormatter({ path: "/500" });
    } else {
      document.title = "500 - Error";
    }
  }

  private attachEventListeners() {
    // Handle button clicks with data-click attributes
    const buttons = this.querySelectorAll("[data-click]");
    buttons.forEach((button: Element) => {
      const action = button.getAttribute("data-click");
      if (action === "greet") {
        button.addEventListener("click", () => {
          alert("Hello from the router! 🎉");
        });
      }
    });
  }

  // Public API methods
  public addRoute(path: string, config: Omit<RouteConfig, "path">) {
    const newRoute: RouteConfig = { path, ...config };

    // Update the routes property to trigger reactivity
    this.routes = [...this.routes.filter((r) => r.path !== path), newRoute];
  }

  public removeRoute(path: string) {
    // Update the routes property to trigger reactivity
    this.routes = this.routes.filter((r) => r.path !== path);
  }

  public getCurrentPath(): string {
    return this.currentPath;
  }

  public getRoutes(): RouteConfig[] {
    return [...this.routes];
  }
}
