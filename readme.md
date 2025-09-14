# webpub

A small and pragmatic website builder

**PRERELEASE**

## Design

Use few, well supported dependencies. We want **resilience**.

Focus on doing things right - in a pragmatic sense. We want **transparency**.

## Usage

This repository contains the tool itself, and a (work-in-progress) default/test _content directory_ + _rendering template_.

Please consult the [webpub-starter](https://github.com/jorgenskogmo/webpub-starter) repo and follow the **User documentation** there.

---

## Developer documentation

## Requirements

- node.js with npm, version: 22.14+
- Only tested on macOS

## Cli

The primary use of this tool is to install it as a dev-dependency in a node/npm project containing _your_ content directory and a _rendering template_.

The package provdes the `webpub` "bin" field, so consuming projects can invoke it via their package.json scripts section:

```js
// package.json

"scripts": {
  "dev": "webpub dev", // starts a dev-server in watch-mode
  "build": "webpub"    // just run the build
},
```

## Core

During development, the main entry point is `src/index.ts`.

```sh
bun src/index.ts
// or
ts-node src/index.ts
```

The core features are

- Collect and resolve `config`, from the user-provided `webpub.config.js` and `package.json` files, and merge them with defaults.

- Scan the user-provided `content` directory, indexing each `index.md` file and replicating the directory structure of the content directory in the `dist` (or value of the `config.output-directory`).

- Pass Page data through the _templates_ and _plugins_, precomputing the Page Tree (that represents children of the current page) and Page Type (indicating if the current Page is a "list" or "detail" page) on the go

- Write _template output_ to index.html pages

- (optionally) run a simple dev-server (on a configurable port, default 3000)

- (optionally) watch the _content_ and _template_ directories for changes, run rebuild and hot-reload the dev-server served pages when a change is detected

## Templates

A template (please check `src/types.ts#Template` for the Type) simply exports a `render` function and will receive current WebpubConfig and Page data for each `index.md` file found in the _content directory_.

Its then up to the template to render some HTML to structure that data, and return a full HTML page.

## Plugins

Webpub plugins can respond to various hooks in the re-build process.

Currently there is only two plugins available:

- webpub-plugin-img: That creates a (resized) copy of all images used in a page

- webpub-plugin-srcset: That creates a range of resized copies of all images used in a page and adds a .srcset attribute to the img-tags on each page

More is planned.
