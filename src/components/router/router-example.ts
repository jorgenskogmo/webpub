// Example usage of the ds-router component

import { Router } from "./index.js";

// Example: Programmatic navigation
function exampleUsage() {
  const router = document.querySelector("ds-router") as Router;

  if (router) {
    // Listen for route changes
    router.addEventListener("route-changed", (event: any) => {
      console.log("Route changed to:", event.detail.path);

      // Update page title based on route
      const routeNames: Record<string, string> = {
        "/": "Home",
        "/about": "About",
      };

      const pageName = routeNames[event.detail.path] || "Page";
      document.title = `Lit Site - ${pageName}`;
    });

    // Example: Add a dynamic route
    router.addRoute("/contact", {
      templatePath: `
        <div class="container">
          <nav>
            <a href="/">Home</a> |
            <a href="/about">About</a> |
            <a href="/contact">Contact</a>
          </nav>
          <main>
            <h1>Contact Us</h1>
            <p>This is a dynamically added route!</p>
            <p>Email: hello@litsite.com</p>
            <a href="/">← Back to Home</a>
          </main>
        </div>
      `,
    });

    // Example: Programmatic navigation after 3 seconds
    setTimeout(() => {
      console.log("Auto-navigating to contact page...");
      router.navigate("/contact");
    }, 3000);
  }
}

// // Run example when DOM is loaded
// if (document.readyState === "loading") {
//   document.addEventListener("DOMContentLoaded", exampleUsage);
// } else {
//   exampleUsage();
// }

export { exampleUsage };
