#!/usr/bin/env bun

import { main } from "./index.js";

console.log("# webpub cli");
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
