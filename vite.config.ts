import { defineConfig } from "vite";
export default defineConfig({
  build: {
    outDir: "site/assets/bundle",
    assetsDir: "",
    rollupOptions: {
      input: "templates/themes/qdi-ds/entry.ts",
    },
  },
  base: "/assets/bundle/",
});
