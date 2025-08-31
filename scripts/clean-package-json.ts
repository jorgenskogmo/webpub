import { copyFileSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const srcPkg = resolve(__dirname, "../package.json");
const distPkg = resolve(__dirname, "../dist/package.json");

// Copy package.json to dist
copyFileSync(srcPkg, distPkg);

// Read and clean package.json
const pkg = JSON.parse(readFileSync(distPkg, "utf8"));

// Remove devDependencies and scripts
delete pkg.devDependencies;
delete pkg.scripts;

// Optionally, remove other fields not needed for publish
// delete pkg.files;
// delete pkg.exports;

writeFileSync(distPkg, JSON.stringify(pkg, null, 2));
