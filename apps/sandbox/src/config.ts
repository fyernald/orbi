// Read from the environment. The defaults are for pnpm dev on your own computer.
export type SandboxConfig = {
	host: string;
	port: number;
	// the only page that may embed the sandbox: Orbi's client
	appOrigin: string;
};

export function readConfig(env: NodeJS.ProcessEnv): SandboxConfig {
	const port = Number(env.SANDBOX_PORT ?? 3200);
	if (!Number.isInteger(port) || port <= 0) {
		throw new Error('SANDBOX_PORT must be a port number.');
	}
	const appOrigin = new URL(env.APP_ORIGIN ?? 'http://localhost:3000').origin;
	return { host: env.HOST ?? '127.0.0.1', port, appOrigin };
}
