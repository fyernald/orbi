import { createHash } from 'node:crypto';
import rateLimit from '@fastify/rate-limit';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import { TooManyRequestsError } from './errors';

// requests per minute, but beta keys per 15 minutes
export type RateLimits = {
	default: number;
	pdfUpload: number;
	keyPoints: number;
	voiceNote: number;
	followUps: number;
	sessionAnswer: number;
	explainAnswer: number;
	betaKey: number;
};

export const RATE_LIMITS: RateLimits = {
	default: 200,
	pdfUpload: 10,
	// each one is a run of model calls over a whole PDF
	keyPoints: 10,
	// each one sends a recording to a model
	voiceNote: 10,
	followUps: 20,
	sessionAnswer: 60,
	// each new one is a model call
	explainAnswer: 20,
	betaKey: 5,
};

// a route's own limit, instead of the default
export const routeLimit = (max: number) => ({
	rateLimit: { max, timeWindow: '1 minute' },
});

const SESSION_COOKIE =
	/(?:^|;\s*)(?:__Secure-)?better-auth\.session_token=([^;]+)/;

// Students at an event share one public address, so a request with a session
// cookie counts against that session, and only the others against the address.
// A made-up cookie gets its own count, but it only ever gets a 401.
export function rateLimitKey(request: FastifyRequest): string {
	const token = request.headers.cookie?.match(SESSION_COOKIE)?.[1];
	if (!token) return `ip:${request.ip}`;
	return `session:${createHash('sha256').update(token).digest('base64url')}`;
}

// Every API route is limited, kept in memory (the API runs as one process).
// A route can set a lower max with config.rateLimit.
export function registerRateLimit(
	app: FastifyInstance,
	max: number = RATE_LIMITS.default
) {
	app.register(rateLimit, {
		max,
		timeWindow: '1 minute',
		keyGenerator: rateLimitKey,
		errorResponseBuilder: (_request, { after }) =>
			new TooManyRequestsError(
				`Too many requests. Wait ${after} and try again.`
			),
	});
}
