/**
 * From
 * [ansi-regex](https://github.com/chalk/ansi-regex) version 6.2.2 (MIT) by Sindre Sorhus
 * [strip-ansi](https://github.com/chalk/strip-ansi) version 7.1.2 (MIT) by Sindre Sorhus
 *
 * with modifications to be ESM and TypeScript compliant.
 */

// Valid string terminator sequences are BEL, ESC\, and 0x9c
const ST = "(?:\\u0007|\\u001B\\u005C|\\u009C)";

// OSC sequences only: ESC ] ... ST (non-greedy until the first ST)
const osc = `(?:\\u001B\\][\\s\\S]*?${ST})`;

// CSI and related: ESC/C1, optional intermediates, optional params (supports ; and :) then final byte
const csi =
	"[\\u001B\\u009B][[\\]()#;?]*(?:\\d{1,4}(?:[;:]\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]";

const pattern = `${osc}|${csi}`;

const regex = new RegExp(pattern, "g");

export function stripAnsi(str: string): string {
	if (typeof str !== "string") {
		throw new TypeError(`Expected a \`string\`, got \`${typeof str}\``);
	}

	// Even though the regex is global, we don't need to reset the `.lastIndex`
	// because unlike `.exec()` and `.test()`, `.replace()` does it automatically
	// and doing it manually has a performance penalty.
	return str.replace(regex, "");
}
