type Thresholds = {
	green: number;
	yellow: number;
};

type TimerResult = {
	label: string;
	ms: number | null;
	formatted: string | null;
	status: "green" | "yellow" | "red" | null;
	event: "start" | "lapse" | "end";
	timestamp: string;
	message?: string;
};

type Messages = {
	start: string;
	lapse: string;
	end: string;
};

type LogLevel =
	| 0 // silent
	| 1 // complete only
	| 2 // no lapse
	| 3 // normal
	| 4; // debug

type Config = {
	thresholds: Thresholds;
	loglevel: LogLevel;
	json: boolean;
	colors: boolean;
	messages: Messages;
};

const timers = new Map<string, number>();
const taskConfigs = new Map<string, Config>();

let globalConfig: Config = {
	thresholds: { green: 1000, yellow: 3000 },
	loglevel: 3,
	json: false,
	// auto-disable colors if not in a TTY (e.g. Jenkins, file redirect)
	colors: Boolean(process.stdout.isTTY),
	messages: {
		start: "starting",
		lapse: "lapse",
		end: "complete",
	},
};

// ANSI color helpers
const ansi = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	dim: "\x1b[2m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	red: "\x1b[31m",
	blue: "\x1b[34m",
	pink: "\x1b[35m",
	grey: "\x1b[90m",
};

function getConfig(label: string): Config {
	return taskConfigs.get(label) ?? globalConfig;
}

function colorize(
	value: string,
	unit: string,
	status: Exclude<TimerResult["status"], null>,
	config: Config,
): string {
	if (!config.colors) return value + unit;

	let colorCode: string;
	switch (status) {
		case "green":
			colorCode = ansi.green;
			break;
		case "yellow":
			colorCode = ansi.yellow;
			break;
		case "red":
			colorCode = ansi.red;
			break;
	}

	return (
		ansi.bright +
		colorCode +
		value +
		ansi.reset +
		ansi.dim +
		colorCode +
		unit +
		ansi.reset
	);
}

// Format ms into Vitest-style string
export function formatTime(ms: number): string {
	if (ms < 1000) {
		return `${ms}ms`;
	}
	if (ms < 60_000) {
		return `${(ms / 1000).toFixed(2)}s`;
	}
	const minutes = Math.floor(ms / 60_000);
	const seconds = Math.floor((ms % 60_000) / 1000);
	return `${minutes}m ${seconds}s`;
}

function getStatus(
	ms: number,
	config: Config,
): Exclude<TimerResult["status"], null> {
	if (ms < config.thresholds.green) return "green";
	if (ms < config.thresholds.yellow) return "yellow";
	return "red";
}

function nowISO(): string {
	return new Date().toISOString();
}

function buildResult(
	label: string,
	message: string,
	ms: number,
	prefix: string,
	prefixColor: string,
	event: "lapse" | "end",
	config: Config,
): string | TimerResult {
	const formatted = formatTime(ms);
	const status = getStatus(ms, config);

	if (config.json) {
		const payload: TimerResult = {
			label,
			ms,
			formatted,
			status,
			event,
			timestamp: nowISO(),
			message,
		};
		console.log(payload);
		return payload;
	}

	// Match number + unit (ms, s, m)
	const match = formatted.match(/^([\d.]+)(ms|s|m)$/);
	let value = formatted;
	if (match) {
		value = colorize(match[1], match[2], status, config);
	}

	const prefixStr = config.colors
		? ansi.bright + prefixColor + prefix + ansi.reset
		: prefix;

	const out = `${prefixStr} ${label}: ${config.colors ? ansi.grey : ""}${message}${config.colors ? ansi.reset : ""} ${value}`;
	if (event === "lapse" && config.loglevel > 2) console.log(out);
	if (event === "end" && config.loglevel >= 1) console.log(`${out}\n`);
	return out;
}

export const timer = {
	configure(opts: Partial<Config>): void {
		globalConfig = {
			...globalConfig,
			...opts,
			messages: { ...globalConfig.messages, ...opts.messages },
		};
	},

	config: globalConfig,

	start(label: string, overrides?: Partial<Config>): string | TimerResult {
		const taskConfig: Config = {
			...globalConfig,
			...overrides,
			messages: { ...globalConfig.messages, ...overrides?.messages },
		};
		taskConfigs.set(label, taskConfig);
		timers.set(label, performance.now());

		if (taskConfig.json) {
			const payload: TimerResult = {
				label,
				ms: 0,
				formatted: "0ms",
				status: "green",
				event: "start",
				timestamp: nowISO(),
				message: taskConfig.messages.start,
			};
			console.log(payload);
			return payload;
		}

		const prefixStr = taskConfig.colors ? `${ansi.pink}○${ansi.reset}` : "○";
		const out = `${prefixStr} ${label}: ${taskConfig.colors ? ansi.grey : ""}${taskConfig.messages.start}${taskConfig.colors ? ansi.reset : ""}`;
		if (taskConfig.loglevel >= 2) console.log(out);
		return out;
	},

	lapse(label: string, message?: string): string | TimerResult {
		const start = timers.get(label);
		if (start == null) throw new Error(`No timer found for label "${label}"`);
		const config = getConfig(label);
		const ms = Math.round(performance.now() - start);
		return buildResult(
			label,
			message ?? config.messages.lapse,
			ms,
			"⋯",
			ansi.blue,
			"lapse",
			config,
		);
	},

	end(label: string, message?: string): string | TimerResult {
		const start = timers.get(label);
		if (start == null) throw new Error(`No timer found for label "${label}"`);
		const config = getConfig(label);
		timers.delete(label);
		taskConfigs.delete(label);
		const ms = Math.round(performance.now() - start);
		return buildResult(
			label,
			message ?? config.messages.end,
			ms,
			"✓",
			ansi.bright + ansi.green,
			"end",
			config,
		);
	},
};
