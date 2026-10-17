import { buildApp } from './app';

const port = Number(process.env.SERVER_PORT ?? 3001);
const host = process.env.HOST ?? '127.0.0.1';

const app: ReturnType<typeof buildApp> = buildApp();

app.listen({ port, host }).catch((error) => {
	app.log.error(error);
	process.exit(1);
});
