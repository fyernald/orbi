import { describe, expect, it } from 'vitest';
import { loadConfig } from './config';

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

	it('gives each student a daily AI budget, 1,000,000 tokens unless set', () => {
		const local = { ...base, APP_ENV: 'local' };

		expect(loadConfig(local).aiDailyTokens).toBe(1_000_000);
		expect(
			loadConfig({ ...local, AI_DAILY_TOKENS_PER_STUDENT: '250000' })
				.aiDailyTokens
		).toBe(250_000);
		expect(() =>
			loadConfig({ ...local, AI_DAILY_TOKENS_PER_STUDENT: '0' })
		).toThrow(/AI_DAILY_TOKENS_PER_STUDENT/);
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
		).toEqual({ dsn, release: 'abc123' });
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
