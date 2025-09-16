# Changelog

Tracking TODOs from both webpub and webpub-starter

- [x] feat(webpub): content.json should NOT be in content
      -> removed content.json
- [x] fix(webpub): read name, version from user package.json
      -> optionally specify in webpub.config.js
- [x] feat(webpub): obey 'dev' or 'build' (default) mode
- [x] feat(webpub): decide how to handle image(s) when the srcset plugin is not used
      -> imgPlugin
- [x] feat(webpub): include imgPlugin by default
- [x] chore(webpub): run with node (not bun), rename config file to webpub.config.js (was .ts)
- [x] fix(webpub): dont create image dir if no images
- [x] feat(pub): setup gh action for npm publishing
- [x] feat(pub): setup npm account
- [x] first npm release: 0.1.62!
- [x] feat(plugin): add plugin-name
- [x] fix(webpub): consider if (the optional) vite.config.ts should live in the template dir that uses it (not root)?
      -> if a `webpub-bundle-entry.ts` file is present in the template root, it will be bundled (with Vite) and added to dist/assets

- [-] Add userConfig optional field to config to hold site specific vars. Will be passed to each builder.
- [ ] fix(data) "URL: "/./" -> "/"
- [ ] feat(plugin:srcset+img): image_formats: ["jpeg", "webp", "avif"]
      -> only for picture-tag ?
- [ ] feat(plugin) Make 'collection' plugin (aka tags, categories, series, etc) that supports listing pages and filtering
- [ ] feat(plugin) Solve plugin incompat somehow (e.g. srset replaces img)
- [ ] feat(frontmatter) might specify thumbnail
- [ ] feat(template): default page template is main()
      lets follow a convention where page.url (e.g. "projects") would look for a render method
      called renderProjects(config, page) in this file
      if found, use that instead of main()....
- [ ] support `npx webpub` command to run un-installed in a project
- [ ] support `npx create webpub@latest` command to bootstrap a (sample) project
- [ ] swap vite for esbuild
- [ ] swap marked for micromark
- [ ] remove clear funtion from package.json
