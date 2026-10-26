import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { buildApp } from './app';
import { createAuth } from './auth';
import { loadConfig } from './config';
import { createDb } from './db';
import { createConsoleMailer } from './mail/console';
import { createSmtpMailer } from './mail/mailer';

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

const app: ReturnType<typeof buildApp> = buildApp({ auth });

app.listen({ port: config.port, host: config.host }).catch((error) => {
	app.log.error(error);
	process.exit(1);
});
