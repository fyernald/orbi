import { createServer } from 'node:http';
import { readConfig } from './config';
import { createResponder } from './respond';
import { createRoutes } from './routes';

// The sandbox origin (US-42 part 4): serves the page mini-apps run in, on an
// origin of its own, so their code can never reach Orbi's page, cookies or API.
const config = readConfig(process.env);
const respond = createResponder(
	createRoutes(new URL('./', import.meta.url)),
	config.appOrigin,
	{ cache: process.env.NODE_ENV === 'production' }
);

const server = createServer((request, response) => {
	const path = new URL(request.url ?? '/', 'http://sandbox').pathname;
	respond(request.method ?? 'GET', path)
		.then(({ status, headers, body }) => {
			response.writeHead(status, headers);
			response.end(request.method === 'HEAD' ? undefined : body);
		})
		.catch((error: unknown) => {
			console.error(error);
			response.writeHead(500).end();
		});
});

server.listen(config.port, config.host, () => {
	console.warn(
		`Sandbox on http://${config.host}:${config.port}, for ${config.appOrigin}`
	);
});

// docker stop sends SIGTERM; finish open requests, then exit
process.on('SIGTERM', () => server.close(() => process.exit(0)));
