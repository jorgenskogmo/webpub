// example.ts
import { timer } from "./timer.js";

async function main() {
	console.log("=== String mode, loglevel 3 (default) ===");

	timer.start("build");
	await new Promise((r) => setTimeout(r, 250)); // simulate work
	timer.lapse("build");
	await new Promise((r) => setTimeout(r, 250)); // simulate work
	timer.lapse("build", "halfway there");
	await new Promise((r) => setTimeout(r, 1200));
	timer.end("build");

	console.log("=== String mode, loglevel 2 ===");
	timer.configure({ loglevel: 2 });
	timer.start("build");
	await new Promise((r) => setTimeout(r, 250)); // simulate work
	timer.lapse("build");
	await new Promise((r) => setTimeout(r, 1200));
	timer.end("build");

	console.log("=== String mode, loglevel 1 ===");
	timer.configure({ loglevel: 1 });
	timer.start("build");
	await new Promise((r) => setTimeout(r, 250)); // simulate work
	timer.lapse("build");
	await new Promise((r) => setTimeout(r, 1200));
	timer.end("build");

	console.log("=== String mode, loglevel 0 (silent) ===");

	// task with overrides
	timer.start("silentTask", { loglevel: 0 });
	await new Promise((r) => setTimeout(r, 250)); // simulate work
	timer.end("silentTask"); // prints nothing

	timer.start("jsonTask", { json: true, loglevel: 4 });
	await new Promise((r) => setTimeout(r, 250)); // simulate work
	timer.lapse("jsonTask", "midway"); // JSON payload
	timer.end("jsonTask", "done"); // JSON payload

	// console.log("\n=== JSON mode ===");

	// timer.configure({ json: true, colors: false });

	// timer.start("test");
	// await new Promise((r) => setTimeout(r, 500));
	// timer.lapse("test");
	// await new Promise((r) => setTimeout(r, 1000));
	// timer.lapse("test");
	// await new Promise((r) => setTimeout(r, 1200));
	// timer.end("test");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
