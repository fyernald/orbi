import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { buildApp } from './app';
import { createDb } from './db';

// the only file that reads the environment and connects the parts
const port = Number(process.env.SERVER_PORT ?? 3001);
const host = process.env.HOST ?? '127.0.0.1';
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set. Copy .env.example to .env.');
}

const db = createDb(databaseUrl);

// bring the database up to date before taking requests, so every deploy migrates by itself
await migrate(db, {
	migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
});

const app: ReturnType<typeof buildApp> = buildApp();

app.listen({ port, host }).catch((error) => {
	app.log.error(error);
	process.exit(1);
});
