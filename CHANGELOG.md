# Changelog

Tracking TODOs from both webpub and webpub-starter

## < 0.1.54

Prerelease

## 0.1.54

+ feat(webpub): content.json should NOT be in content

## 0.1.55 .. 0.1.56

+ fix(webpub): read name, version from user package.json

## 0.1.57

+ feat(webpub): obey 'dev' or 'build' (default) mode

## 0.1.59

+ feat(webpub): decide how to handle image(s) when the srcset plugin is not used -> imgPlugin

+ feat(webpub): include imgPlugin by default

## 0.1.60

+ chore(webpub): run with node (not bun), rename config file to webpub.config.js

## 0.1.61

+ fix(webpub): dont create image dir if no images
+ first npm release

## 0.1.62

+ feat(plugin): add plugin-name

---

## Backlog

+ fix(webpub) [data] "URL: "/./" -> "/"

+ feat(webpub) [srcset+img plugin]: image_formats: ["jpeg", "webp", "avif"] -> only for picture-tag ?

+ fix(webpub): [bundler] consider if (the optional) vite.config.ts should live in the template dir that uses it (not root)?

+ feat(webpub): [plugin] Make 'collection' plugin (aka tags, categories, series, etc) that supports listing pages and filtering

+ feat(webpub): [frontmatter] might specify thumbnail

+ feat(webpub): [template]: default page template is main()
  lets follow a convention where page.url (e.g. "projects") would look for a render method
  called renderProjects(config, page) in this file
  if found, use that instead of main()....
