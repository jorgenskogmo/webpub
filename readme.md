# WebPub

## Requirements

Bun: <https://bun.sh/>

```sh
curl -fsSL https://bun.sh/install | bash
```

and then

```sh
bun --version # developed with 1.2.21
bun install # equivalent to npm install, just faster
```

## Usage

Run the hot-reloading dev server with

```sh
bun run src/webpub.ts
````

When a change is detected in any of the directories defined in webdev.config.ts, the site is rebuilt - and then reloaded.

## Filesystem layout

All these can be configured, @see: config

- ./content : directories with index.md files (@see: content-files)
- ./templates: html layouts
- ./dist: the ready-to-be-deployed static website
