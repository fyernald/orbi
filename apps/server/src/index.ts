import { fileURLToPath } from 'node:url';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { buildApp } from './app';
import { db } from './db';

const port = Number(process.env.SERVER_PORT ?? 3001);
const host = process.env.HOST ?? '127.0.0.1';

// bring the database up to date before taking requests, so every deploy migrates by itself
await migrate(db, {
	migrationsFolder: fileURLToPath(new URL('../drizzle', import.meta.url)),
});

const app: ReturnType<typeof buildApp> = buildApp();

app.listen({ port, host }).catch((error) => {
	app.log.error(error);
	process.exit(1);
});
