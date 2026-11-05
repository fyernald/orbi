import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';

// What the browser sends when the Content-Security-Policy would block something.
// Only these fields are logged: a URL can carry the student's question in its query.
const cspReport = z.object({
	'csp-report': z.object({
		'document-uri': z.string().optional(),
		'blocked-uri': z.string().optional(),
		'violated-directive': z.string().optional(),
		'effective-directive': z.string().optional(),
		'source-file': z.string().optional(),
		'line-number': z.number().optional(),
	}),
});

const withoutQuery = (url: string | undefined) =>
	url?.split(/[?#]/)[0]?.slice(0, 200);

export function cspLogLine(body: unknown) {
	const parsed = cspReport.safeParse(body);
	if (!parsed.success) return undefined;
	const report = parsed.data['csp-report'];
	return {
		directive: report['effective-directive'] ?? report['violated-directive'],
		blocked: withoutQuery(report['blocked-uri']),
		page: withoutQuery(report['document-uri']),
		source: withoutQuery(report['source-file']),
		line: report['line-number'],
	};
}

export function createCspReportRoutes(): FastifyPluginAsync {
	return async (api) => {
		api.addContentTypeParser(
			'application/csp-report',
			{ parseAs: 'string', bodyLimit: 16 * 1024 },
			(_request, body, done) => {
				try {
					done(null, JSON.parse(body as string));
				} catch {
					done(null, undefined);
				}
			}
		);

		// no login: the browser sends reports without the session cookie
		api.post('/csp-report', async (request, reply) => {
			const line = cspLogLine(request.body);
			if (line) request.log.warn(line, 'csp violation');
			return reply.status(204).send();
		});
	};
}
