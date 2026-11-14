import { describe, expect, it } from 'vitest';
import { loadConfig, loadSentryConfig } from './config';
import { USAGE_LIMITS_DEFAULT } from './modules/usage/limits';

const base = {
	DATABASE_URL: 'postgresql://orbi@localhost:5432/orbi',
	BETTER_AUTH_SECRET: 'a-secret-that-is-at-least-32-characters',
	BETTER_AUTH_URL: 'http://localhost:3000',
};

describe('loadConfig', () => {
	it('needs no mail server on a local run', () => {
		const config = loadConfig({ ...base, APP_ENV: 'local' });

		expect(config.env).toBe('local');
		expect(config.smtp).toBeNull();
	});

	it('ignores mail settings on a local run', () => {
		const config = loadConfig({
			...base,
			APP_ENV: 'local',
			SMTP_HOST: 'localhost',
			SMTP_FROM: 'Orbi <no-reply@orbi.local>',
		});

		expect(config.smtp).toBeNull();
	});

	it('runs as production when APP_ENV is not set', () => {
		expect(() => loadConfig(base)).toThrow(/SMTP_HOST/);
	});

	it('uses the mail server in production', () => {
		const config = loadConfig({
			...base,
			APP_ENV: 'production',
			SMTP_HOST: 'smtp.example.com',
			SMTP_FROM: 'Orbi <no-reply@orbi.study>',
		});

		expect(config.smtp?.host).toBe('smtp.example.com');
	});

	it("uses the beta's AI usage limits unless they are set", () => {
		const local = { ...base, APP_ENV: 'local' };

		expect(loadConfig(local).usageLimits).toEqual(USAGE_LIMITS_DEFAULT);
		expect(
			loadConfig({
				...local,
				AI_HOURLY_CREDITS: '1000',
				AI_WEEKLY_CREDITS: '5000',
				AI_GRACE_PERCENT: '0',
				AI_TOTAL_CREDITS: '9000',
			}).usageLimits
		).toEqual({
			hourCredits: 1000,
			weekCredits: 5000,
			gracePercent: 0,
			totalCredits: 9000,
		});
		expect(() => loadConfig({ ...local, AI_HOURLY_CREDITS: '0' })).toThrow(
			/AI_HOURLY_CREDITS/
		);
	});

	it('offers only the models in AI_ENABLED_MODELS when it is set', () => {
		const local = { ...base, APP_ENV: 'local' };

		expect(loadConfig(local).aiEnabledModels).toBeUndefined();
		expect(
			loadConfig({ ...local, AI_ENABLED_MODELS: '' }).aiEnabledModels
		).toBeUndefined();
		expect(
			loadConfig({
				...local,
				AI_ENABLED_MODELS: 'deepseek-flash, claude-haiku',
			}).aiEnabledModels
		).toEqual(['deepseek-flash', 'claude-haiku']);
		expect(() => loadConfig({ ...local, AI_ENABLED_MODELS: 'gpt-5' })).toThrow(
			/AI_ENABLED_MODELS/
		);
	});

	it('needs beta keys in production unless it is turned off', () => {
		const production = {
			...base,
			APP_ENV: 'production',
			SMTP_HOST: 'smtp.example.com',
			SMTP_FROM: 'Orbi <no-reply@orbi.study>',
		};

		expect(loadConfig(production).beta).toEqual({
			keysRequired: true,
			adminEmails: [],
			accessDays: 30,
		});
		expect(loadConfig({ ...base, APP_ENV: 'local' }).beta.keysRequired).toBe(
			false
		);
		expect(
			loadConfig({
				...production,
				BETA_KEYS_REQUIRED: 'false',
				ADMIN_EMAILS: 'dev@orbi.study, ops@orbi.study',
			}).beta
		).toMatchObject({
			keysRequired: false,
			adminEmails: ['dev@orbi.study', 'ops@orbi.study'],
		});
		expect(() =>
			loadConfig({ ...production, ADMIN_EMAILS: 'not an email' })
		).toThrow(/ADMIN_EMAILS/);
	});

	it('turns Sentry on only in production with a DSN', () => {
		const production = {
			...base,
			APP_ENV: 'production',
			SMTP_HOST: 'smtp.example.com',
			SMTP_FROM: 'Orbi <no-reply@orbi.study>',
		};
		const dsn = 'https://key@o1.ingest.de.sentry.io/2';

		expect(loadConfig(production).sentry).toBeNull();
		expect(loadConfig({ ...production, SENTRY_DSN: '' }).sentry).toBeNull();
		expect(
			loadConfig({ ...base, APP_ENV: 'local', SENTRY_DSN: dsn }).sentry
		).toBeNull();
		expect(
			loadConfig({ ...production, SENTRY_DSN: dsn, SENTRY_RELEASE: 'abc123' })
				.sentry
		).toEqual({ dsn, release: 'abc123', tracesSampleRate: 0.2 });
	});

	it('traces a share of requests, 0.2 unless SENTRY_TRACES_SAMPLE_RATE says', () => {
		const production = {
			...base,
			APP_ENV: 'production',
			SMTP_HOST: 'smtp.example.com',
			SMTP_FROM: 'Orbi <no-reply@orbi.study>',
			SENTRY_DSN: 'https://key@o1.ingest.de.sentry.io/2',
		};
		const rate = (value: string) =>
			loadConfig({ ...production, SENTRY_TRACES_SAMPLE_RATE: value }).sentry
				?.tracesSampleRate;

		expect(rate('')).toBe(0.2);
		expect(rate('0.05')).toBe(0.05);
		expect(rate('0')).toBe(0);
		expect(() => rate('2')).toThrow(/SENTRY_TRACES_SAMPLE_RATE/);
		expect(() => rate('often')).toThrow(/SENTRY_TRACES_SAMPLE_RATE/);
	});

	it('gives instrument.ts the same Sentry settings without the other variables', () => {
		const dsn = 'https://key@o1.ingest.de.sentry.io/2';

		expect(loadSentryConfig({ SENTRY_DSN: dsn })).toEqual({
			dsn,
			release: undefined,
			tracesSampleRate: 0.2,
		});
		expect(loadSentryConfig({ APP_ENV: 'local', SENTRY_DSN: dsn })).toBeNull();
		expect(loadSentryConfig({})).toBeNull();
		expect(() =>
			loadSentryConfig({ SENTRY_DSN: dsn, SENTRY_TRACES_SAMPLE_RATE: '-1' })
		).toThrow(/SENTRY_TRACES_SAMPLE_RATE/);
	});

	it('treats an empty AI key as not set', () => {
		const config = loadConfig({
			...base,
			APP_ENV: 'local',
			GEMINI_API_KEY: 'gemini-key',
			ANTHROPIC_API_KEY: '',
			DEEPSEEK_API_KEY: 'deepseek-key',
		});

		expect(config.aiKeys).toEqual({
			google: 'gemini-key',
			anthropic: undefined,
			deepseek: 'deepseek-key',
		});
	});
});
