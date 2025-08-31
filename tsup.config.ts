import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/*.ts"],
  outDir: "dist/src",
  clean: true,
  dts: true,
  sourcemap: true,
  format: ["cjs"],
  splitting: false,
  minify: false,
  external: ["node:util", "node:fs", "node:path"],
  onSuccess: "bun scripts/clean-package-json.ts && bun scripts/copy-readme.ts",
});
