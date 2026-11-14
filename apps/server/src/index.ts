import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createTokenBudget } from './ai/budget';
import { createModelRegistry, createProviderFactories } from './ai/models';
import { buildApp } from './app';
import { createAuth } from './auth';
import { loadConfig } from './config';
import { createDb } from './db';
import { noErrorReporter, sentryReporter } from './error-reporter';
import { createConsoleMailer } from './mail/console';
import { createSmtpMailer } from './mail/mailer';
import { createBreachedPasswordCheck } from './modules/auth/breached-password';
import { createWorkerPdfReader } from './pdf/worker-reader';
import { createServices } from './services';

// the only file that reads the environment and connects the parts
const config = loadConfig();
const errors = config.sentry ? sentryReporter : noErrorReporter;
const db = createDb(config.databaseUrl);
const mailer = config.smtp
	? createSmtpMailer(config.smtp)
	: createConsoleMailer();
const auth = createAuth({
	db,
	mailer,
	requireEmailVerification: config.env === 'production',
	isPasswordBreached: createBreachedPasswordCheck({
		onError: (error) =>
			app.log.warn({ err: error }, 'breached password check failed'),
	}),
	...config.auth,
});

// bring the database up to date before taking requests, so every deploy migrates by itself
await migrate(db, {
	migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
});

const services = createServices({
	db,
	pdf: createWorkerPdfReader(),
	beta: {
		...config.beta,
		requireVerifiedEmail: config.env === 'production',
	},
	models: createModelRegistry({
		providers: createProviderFactories(config.aiKeys),
	}),
	budget: createTokenBudget({ dailyTokens: config.aiDailyTokens }),
	logError: (error) => {
		app.log.error(error);
		errors.report(error);
	},
	logUsage: (line) => app.log.info(line, 'ai usage'),
});

const app: ReturnType<typeof buildApp> = buildApp({
	auth,
	services,
	reportError: errors.report,
});
app.addHook('onClose', () => db.$client.end());

// a deploy stops the container with SIGTERM: finish the open requests first
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
	process.once(signal, () => {
		app.log.info(`${signal} received, shutting down`);
		app
			.close()
			.then(
				() => 0,
				(error) => {
					app.log.error(error);
					errors.report(error);
					return 1;
				}
			)
			// the last reports are sent before the process ends
			.then((code) => errors.flush().then(() => process.exit(code)));
	});
}

app.listen({ port: config.port, host: config.host }).catch(async (error) => {
	app.log.error(error);
	errors.report(error);
	await errors.flush();
	process.exit(1);
});
