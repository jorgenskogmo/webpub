import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { timer, formatTime } from "./timer.js";

describe("timer utility", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// reset config before each test
		timer.configure({
			json: false,
			colors: false,
			messages: { start: "starting", lapse: "lapse", end: "complete" },
		});
		// silence console.log output
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	it("should start and end a timer with default messages", async () => {
		timer.start("task");
		await new Promise((r) => setTimeout(r, 20));
		const result = timer.end("task");

		expect(typeof result).toBe("string");
		expect(result).toContain("✓ task");
		expect(result).toContain("complete");
	});

	it("should return a lapse without ending the timer", async () => {
		timer.start("process");
		await new Promise((r) => setTimeout(r, 10));
		const result = timer.lapse("process");

		expect(typeof result).toBe("string");
		expect(result).toContain("process");
		expect(result).toContain("lapse");
	});

	it("should accept custom messages for lapse and end", async () => {
		timer.start("custom");
		await new Promise((r) => setTimeout(r, 5));

		const lapseResult = timer.lapse("custom", "halfway there") as string;
		expect(lapseResult).toContain("halfway there");

		const endResult = timer.end("custom", "all done") as string;
		expect(endResult).toContain("all done");
	});

	it("should return JSON with default messages", async () => {
		timer.configure({ json: true, colors: false });
		timer.start("jsonTask");
		await new Promise((r) => setTimeout(r, 5));
		const result = timer.end("jsonTask");

		expect(result).toHaveProperty("label", "jsonTask");
		expect(result).toHaveProperty("event", "end");
		expect(result).toHaveProperty("message", "complete");
	});

	it("should return JSON with custom messages", async () => {
		timer.configure({ json: true, colors: false });
		timer.start("jsonCustom");
		await new Promise((r) => setTimeout(r, 5));
		const result = timer.end("jsonCustom", "wrapped up");

		expect(result).toHaveProperty("message", "wrapped up");
	});

	it("should clear timer after end()", () => {
		timer.start("clear");
		timer.end("clear");
		expect(() => timer.lapse("clear")).toThrow();
	});

	it("should respect custom thresholds", async () => {
		timer.configure({
			json: true,
			thresholds: { green: 1, yellow: 2 }, // super low thresholds
			colors: false,
		});

		timer.start("fast");
		await new Promise((r) => setTimeout(r, 3));
		const result = timer.end("fast") as { status: string };

		expect(["yellow", "red"]).toContain(result.status);
	});

	it("should format time correctly", () => {
		expect(formatTime(999)).toBe("999ms");
		expect(formatTime(1500)).toBe("1.50s");
		expect(formatTime(65_000)).toBe("1m 5s");
	});

	it("should not output ANSI codes when not TTY", async () => {
		const orig = process.stdout.isTTY;
		process.stdout.isTTY = false;

		timer.configure({ colors: undefined }); // reset detection
		timer.start("noColor");
		const result = timer.end("noColor") as string;

		process.stdout.isTTY = orig;

		// biome-ignore lint/suspicious/noControlCharactersInRegex: <explanation>
		expect(result).not.toMatch(/\x1b\[[0-9;]*m/); // no escape sequences
	});
});
