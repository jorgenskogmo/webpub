# Lit Site - TypeScript + Build Tool + Bun Workspace

## Overview

This workspace is configured for modern web development using TypeScript, build tooling, and Bun. It provides a fast development experience with hot module replacement, TypeScript type checking, and native TypeScript execution via Bun.

## Project Structure

```text
lit-site/
├── bun.config.toml     # Bun configuration
├── index.html          # Entry HTML file
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── build.config.ts     # Build tool bundler configuration
├── scripts/            # Build scripts
│   └── build-static.ts # Static site generator (TypeScript)
├── public/             # Static assets (served as-is)
├── src/                # Source code
│   ├── main.ts         # Main TypeScript entry point
│   ├── style.css       # Global styles
│   ├── components/     # Reusable components
│   ├── data/          # Data files, APIs, utilities
│   └── pages/         # Page template files (.thtml)
│       ├── home.thtml  # Home page template
│       └── about.thtml # About page template
└── dist-static/       # Static site output (generated)
```

## Available Scripts

- `bun run dev` - Start development server with hot reloading (port 3000)
- `bun run build` - Build for production (SPA)
- `bun run preview` - Preview production build locally
- `bun run generate` - Generate static site using Bun + TypeScript
- `bun run serve:static` - Serve the generated static site

## Technology Stack

- **TypeScript** - Type-safe JavaScript with modern features
- **Bun** - Fast JavaScript runtime with native TypeScript support
- **Build Tool** - Fast build tool and dev server
- **lit-html** - Efficient, expressive templates
- **@lit-labs/rendering** - Server-side rendering for static generation
- **Modern ES Modules** - Native module system

## Development Workflow

1. Run `bun install` to install dependencies
2. Run `bun run dev` to start the development server
3. Open <http://localhost:3000> in your browser
4. Edit files in `src/` and see changes automatically reflected

## Static Site Generation Workflow

1. Edit page content in `src/pages/*.thtml` files
2. Run `bun run generate` to create static files
3. Use `bun run serve:static` to preview the static site
4. Deploy the `dist-static/` folder to any static hosting service

## Configuration Details

- **TypeScript**: Strict mode enabled with modern target (ES2020)
- **Bun**: Native TypeScript execution, no compilation step needed
- **Build Tool**: Configured for fast HMR and optimized builds
- **Module System**: ES modules with bundler resolution
- **Development**: Hot reloading on port 3000

## File Types Supported

- `.ts` - TypeScript files
- `.js` - JavaScript files
- `.css` - Stylesheets
- `.html` - HTML templates
- `.json` - Data files

## Getting Started

The main entry point is `src/main.ts`. This file is automatically loaded by the HTML page and serves as the application bootstrap. Add your components, pages, and logic starting from here.

## Static Site Generation (SSG)

This workspace supports static site generation using Lit's SSR capabilities:

### How it works

- Uses `@lit-labs/ssr` to pre-render lit-html templates
- Generates fully static HTML files with embedded CSS
- Perfect for blogs, documentation sites, or any content-heavy site
- Provides excellent SEO and performance benefits

### SSG Workflow

1. Create templates in `scripts/build-static.js` (or import from `src/`)
2. Run `npm run generate` to create static files in `dist-static/`
3. Use `npm run serve:static` to preview the static site locally
4. Deploy the `dist-static/` folder to any static hosting service

### Benefits

- **SEO-friendly**: Pre-rendered HTML content
- **Fast loading**: No JavaScript required for initial render
- **Progressive enhancement**: Can add interactivity with client-side JS
- **Easy deployment**: Just static files, works anywhere

Last updated: August 22, 2025
