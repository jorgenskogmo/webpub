import { createConsola } from "consola";

export const logger = createConsola({
	level: 1,
	formatOptions: {
		columns: 80,
		colors: true,
		compact: false,
		date: false,
	},
});

// keep a reference to the original
const original = logger.success;

// ✅ args come from raw (tuple type, spread works)
type SuccessArgs = Parameters<typeof original.raw>;

// build wrapper
const patched: typeof original = ((...args: SuccessArgs) => {
	const prev = logger.level;
	logger.level = 4; // temporarily max level
	original.raw(...args);
	logger.level = prev;
}) as typeof original;

// also patch .raw
patched.raw = (...args: SuccessArgs) => {
	const prev = logger.level;
	logger.level = 4;
	original.raw(...args);
	logger.level = prev;
};

logger.success = patched;
