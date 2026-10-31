import { z } from 'zod';
import type { SmtpOptions } from './mail/mailer';

const envSchema = z
	.object({
		APP_ENV: z.enum(['local', 'production']).default('production'),
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
		SMTP_HOST: z.string().optional(),
		SMTP_PORT: z.coerce.number().int().positive().default(587),
		SMTP_FROM: z.string().optional(),
		SMTP_USER: z.string().optional(),
		SMTP_PASSWORD: z.string().optional(),
		// each provider is offered only when its key is set; with none, the tutor is off
		GEMINI_API_KEY: z.string().optional(),
		ANTHROPIC_API_KEY: z.string().optional(),
	})
	// local runs print emails to the console, so only production needs a mail server
	.superRefine((vars, ctx) => {
		if (vars.APP_ENV === 'local') return;
		if (!vars.SMTP_HOST) {
			ctx.addIssue({
				code: 'custom',
				path: ['SMTP_HOST'],
				message: 'Set the mail server.',
			});
		}
		if (!vars.SMTP_FROM) {
			ctx.addIssue({
				code: 'custom',
				path: ['SMTP_FROM'],
				message: 'Set the sender, for example Orbi <no-reply@orbi.study>',
			});
		}
	});

export type AppEnv = 'local' | 'production';

export type Config = {
	env: AppEnv;
	port: number;
	host: string;
	databaseUrl: string;
	auth: { secret: string; baseURL: string };
	smtp: SmtpOptions | null;
	aiKeys: { google?: string; anthropic?: string };
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
		env: vars.APP_ENV,
		port: vars.SERVER_PORT,
		host: vars.HOST,
		databaseUrl: vars.DATABASE_URL,
		auth: { secret: vars.BETTER_AUTH_SECRET, baseURL: vars.BETTER_AUTH_URL },
		smtp:
			vars.APP_ENV === 'local'
				? null
				: {
						host: vars.SMTP_HOST!,
						port: vars.SMTP_PORT,
						from: vars.SMTP_FROM!,
						user: vars.SMTP_USER || undefined,
						password: vars.SMTP_PASSWORD || undefined,
					},
		aiKeys: {
			google: vars.GEMINI_API_KEY || undefined,
			anthropic: vars.ANTHROPIC_API_KEY || undefined,
		},
	};
}
