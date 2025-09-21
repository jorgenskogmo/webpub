import net from "node:net";

/**
 * Find an available port starting from `startPort`.
 * @param startPort - Preferred port to try first.
 * @param maxTries - How many ports to check sequentially.
 */
export async function findAvailablePort(
	startPort = 3000,
	maxTries = 50,
): Promise<number> {
	let port = startPort;

	while (port < startPort + maxTries) {
		const isFree = await checkPort(port);
		if (isFree) return port;
		port++;
	}

	throw new Error(
		`No available ports found in range ${startPort} - ${startPort + maxTries}`,
	);
}

function checkPort(port: number): Promise<boolean> {
	return new Promise((resolve) => {
		const tester = net
			.createServer()
			.once("error", (err: NodeJS.ErrnoException) => {
				if (err.code === "EADDRINUSE") {
					resolve(false);
				} else {
					resolve(false); // other errors, treat as unavailable
				}
			})
			.once("listening", () => {
				tester
					.once("close", () => {
						resolve(true);
					})
					.close();
			})
			.listen(port);
	});
}
