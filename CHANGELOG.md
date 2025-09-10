# Changelog

Tracking TODOs from both webpub and webpub-starter

## < 0.1.54

Prerelease

## 0.1.54

feat(webpub): content.json should NOT be in content

## 0.1.55 .. 0.1.56

fix(webpub): read name, version from user package.json

## 0.1.57

feat(webpub): obey 'dev' or 'build' (default) mode

## 0.1.59

fix(webpub): dont create image dir if no images
feat(webpub): decide how to handle image(s) when the srcset plugin is not used -> imgPlugin
feat(webpub): include imgPlugin by default

## 0.1.60

chore(webpub): run with node (not bun), rename config file to webpub.config.js

---

## TODO

- feat(webpub) [srcset plugin][img plugin]: image_formats: ["jpeg", "webp", "avif"] -> only for <picture>?

- TODO: consider if (the optional) vite.config.ts should live in the template dir that uses it (not root)?

- TODO: Make 'collection' plugin (aka tags, categories, series, etc) that supports listing pages and filtering
