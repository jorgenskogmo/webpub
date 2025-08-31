import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/*.ts"],
  outDir: "dist/src",
  clean: true,
  dts: true,
  sourcemap: true,
  format: ["esm"],
  splitting: false,
  minify: false,
  onSuccess: "bun scripts/clean-package-json.ts && bun scripts/copy-readme.ts",
});
