import { z } from 'zod';
import { DAILY_TOKENS_DEFAULT } from './ai/budget';
import type { SmtpOptions } from './mail/mailer';
import { BETA_ACCESS_DAYS_DEFAULT } from './modules/beta/service';

// the share of API requests traced when SENTRY_TRACES_SAMPLE_RATE is not set
export const TRACES_SAMPLE_RATE_DEFAULT = 0.2;

// instrument.ts reads these on their own, before the rest of the server loads
const sentryVars = {
	APP_ENV: z.enum(['local', 'production']).default('production'),
	// error reports and traces go to Sentry only in production, and only when this is set
	SENTRY_DSN: z.url().optional().or(z.literal('')),
	// the image tag, so a report says which deploy it came from
	SENTRY_RELEASE: z.string().optional(),
	// from 0 (no request is traced) to 1 (every request); empty uses the default
	SENTRY_TRACES_SAMPLE_RATE: z.preprocess(
		(value) => (value === '' ? undefined : value),
		z.coerce.number().min(0).max(1).optional()
	),
};

const sentrySchema = z.object(sentryVars);

const envSchema = z
	.object({
		...sentryVars,
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
		DEEPSEEK_API_KEY: z.string().optional(),
		// how many AI tokens each student may use per day, input and output together
		AI_DAILY_TOKENS_PER_STUDENT: z.coerce
			.number()
			.int()
			.positive()
			.default(DAILY_TOKENS_DEFAULT),
		// the closed beta (US-50): without a key nobody can use the app. Off by default
		// on local runs, so a new account works without one
		BETA_KEYS_REQUIRED: z.stringbool().optional(),
		// developers who get in without a key, separated by commas
		ADMIN_EMAILS: z
			.string()
			.default('')
			.transform((value) =>
				value
					.split(',')
					.map((email) => email.trim())
					.filter(Boolean)
			)
			.pipe(z.array(z.email('ADMIN_EMAILS has an email that is not valid.'))),
		// how many days one beta key gives
		BETA_ACCESS_DAYS: z.coerce
			.number()
			.int()
			.positive()
			.default(BETA_ACCESS_DAYS_DEFAULT),
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

export type SentryConfig = {
	dsn: string;
	release?: string;
	tracesSampleRate: number;
};

export type Config = {
	env: AppEnv;
	port: number;
	host: string;
	databaseUrl: string;
	auth: { secret: string; baseURL: string };
	smtp: SmtpOptions | null;
	aiKeys: { google?: string; anthropic?: string; deepseek?: string };
	aiDailyTokens: number;
	beta: { keysRequired: boolean; adminEmails: string[]; accessDays: number };
	sentry: SentryConfig | null;
};

// fails at startup with every missing or wrong variable listed
function parseEnv<T extends z.ZodType>(
	schema: T,
	env: NodeJS.ProcessEnv
): z.output<T> {
	const result = schema.safeParse(env);
	if (!result.success) {
		throw new Error(
			`Invalid environment variables:\n${z.prettifyError(result.error)}`
		);
	}
	return result.data;
}

function sentryConfig(
	vars: z.output<typeof sentrySchema>
): SentryConfig | null {
	if (vars.APP_ENV !== 'production' || !vars.SENTRY_DSN) return null;
	return {
		dsn: vars.SENTRY_DSN,
		release: vars.SENTRY_RELEASE || undefined,
		tracesSampleRate:
			vars.SENTRY_TRACES_SAMPLE_RATE ?? TRACES_SAMPLE_RATE_DEFAULT,
	};
}

// the same Sentry settings as loadConfig gives, without checking the other variables
export const loadSentryConfig = (
	env: NodeJS.ProcessEnv = process.env
): SentryConfig | null => sentryConfig(parseEnv(sentrySchema, env));

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
	const vars = parseEnv(envSchema, env);
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
			deepseek: vars.DEEPSEEK_API_KEY || undefined,
		},
		aiDailyTokens: vars.AI_DAILY_TOKENS_PER_STUDENT,
		beta: {
			keysRequired: vars.BETA_KEYS_REQUIRED ?? vars.APP_ENV === 'production',
			adminEmails: vars.ADMIN_EMAILS,
			accessDays: vars.BETA_ACCESS_DAYS,
		},
		sentry: sentryConfig(vars),
	};
}
