import { z } from 'zod';

const envSchema = z.object({
	SERVER_PORT: z.coerce.number().int().positive().default(3001),
	HOST: z.string().min(1).default('127.0.0.1'),
	DATABASE_URL: z.string().min(1, 'Copy .env.example to .env.'),
	BETTER_AUTH_SECRET: z
		.string()
		.min(
			32,
			'Use at least 32 characters. Make one with: openssl rand -base64 32'
		),
	BETTER_AUTH_URL: z.url(
		'Use the address of the app, for example http://localhost:3000'
	),
});

export type Config = {
	port: number;
	host: string;
	databaseUrl: string;
	auth: { secret: string; baseURL: string };
};

// fails at startup with every missing or wrong variable listed
export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
	const result = envSchema.safeParse(env);
	if (!result.success) {
		throw new Error(
			`Invalid environment variables:\n${z.prettifyError(result.error)}`
		);
	}

	const vars = result.data;
	return {
		port: vars.SERVER_PORT,
		host: vars.HOST,
		databaseUrl: vars.DATABASE_URL,
		auth: { secret: vars.BETTER_AUTH_SECRET, baseURL: vars.BETTER_AUTH_URL },
	};
}
