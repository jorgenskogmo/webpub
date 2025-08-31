import { copyFileSync } from "fs";
import { resolve } from "path";

const root = resolve(__dirname, "..");
const dist = resolve(root, "dist");

// Copy readme.md to dist
copyFileSync(resolve(root, "readme.md"), resolve(dist, "readme.md"));

// Optionally, add more file copies here if needed
