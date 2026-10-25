import { z } from 'zod';
import type { SmtpOptions } from './mail/mailer';

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
	SMTP_HOST: z.string().min(1, 'Set the mail server, localhost for Mailpit.'),
	SMTP_PORT: z.coerce.number().int().positive().default(587),
	SMTP_FROM: z
		.string()
		.min(1, 'Set the sender, for example Orbi <no-reply@orbi.study>'),
	SMTP_USER: z.string().optional(),
	SMTP_PASSWORD: z.string().optional(),
});

export type Config = {
	port: number;
	host: string;
	databaseUrl: string;
	auth: { secret: string; baseURL: string };
	smtp: SmtpOptions;
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
		smtp: {
			host: vars.SMTP_HOST,
			port: vars.SMTP_PORT,
			from: vars.SMTP_FROM,
			user: vars.SMTP_USER || undefined,
			password: vars.SMTP_PASSWORD || undefined,
		},
	};
}
