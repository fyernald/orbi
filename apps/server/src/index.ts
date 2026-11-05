import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { createTokenBudget } from './ai/budget';
import { createModelRegistry, createProviderFactories } from './ai/models';
import { buildApp } from './app';
import { createAuth } from './auth';
import { loadConfig } from './config';
import { createDb } from './db';
import { createConsoleMailer } from './mail/console';
import { createSmtpMailer } from './mail/mailer';
import { createPdfReader } from './pdf/reader';
import { createServices } from './services';

// the only file that reads the environment and connects the parts
const config = loadConfig();
const db = createDb(config.databaseUrl);
const mailer = config.smtp
	? createSmtpMailer(config.smtp)
	: createConsoleMailer();
const auth = createAuth({
	db,
	mailer,
	requireEmailVerification: config.env === 'production',
	...config.auth,
});

// bring the database up to date before taking requests, so every deploy migrates by itself
await migrate(db, {
	migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
});

const services = createServices({
	db,
	pdf: createPdfReader(),
	models: createModelRegistry({
		providers: createProviderFactories(config.aiKeys),
	}),
	budget: createTokenBudget({ dailyTokens: config.aiDailyTokens }),
	logError: (error) => app.log.error(error),
	logUsage: (line) => app.log.info(line, 'ai usage'),
});

const app: ReturnType<typeof buildApp> = buildApp({ auth, services });
app.addHook('onClose', () => db.$client.end());

// a deploy stops the container with SIGTERM: finish the open requests first
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
	process.once(signal, () => {
		app.log.info(`${signal} received, shutting down`);
		app.close().then(
			() => process.exit(0),
			(error) => {
				app.log.error(error);
				process.exit(1);
			}
		);
	});
}

app.listen({ port: config.port, host: config.host }).catch((error) => {
	app.log.error(error);
	process.exit(1);
});
