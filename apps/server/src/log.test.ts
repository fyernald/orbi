import { APICallError, RetryError, TypeValidationError } from 'ai';
import { DrizzleQueryError } from 'drizzle-orm/errors';
import Fastify from 'fastify';
import { DatabaseError } from 'pg';
import { describe, expect, it } from 'vitest';
import { loggerOptions, safeUrl } from './log';

const secret = 'Mitosis has four phases: prophase, metaphase';

// what the server's logger writes for one error
function logLine(error: unknown) {
	const lines: string[] = [];
	const app = Fastify({
		logger: { ...loggerOptions, stream: { write: (line) => lines.push(line) } },
	});
	app.log.error(error);
	return lines.join('');
}

const apiCallError = () =>
	new APICallError({
		message: 'Resource has been exhausted (e.g. check quota).',
		url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini:streamGenerateContent?alt=sse',
		requestBodyValues: { contents: [{ parts: [{ text: secret }] }] },
		statusCode: 429,
		responseBody: `{"error":{"message":"quota","echo":"${secret}"}}`,
		isRetryable: true,
	});

function postgresError() {
	const error = new DatabaseError(
		'new row for relation "note" violates check constraint "note_content_check"',
		0,
		'error'
	);
	error.code = '23514';
	error.severity = 'ERROR';
	error.constraint = 'note_content_check';
	error.table = 'note';
	error.detail = `Failing row contains (${secret}).`;
	return error;
}

describe('logged errors', () => {
	it('keep the status and the message of an AI call, not the request', () => {
		const line = logLine(
			new RetryError({
				message: `Failed after 2 attempts. Last error: ${secret}`,
				reason: 'maxRetriesExceeded',
				errors: [apiCallError(), apiCallError()],
			})
		);
		expect(line).not.toContain(secret);
		const { err } = JSON.parse(line);
		expect(err).toMatchObject({
			type: 'AI_RetryError',
			attempts: 2,
			lastError: {
				type: 'AI_APICallError',
				statusCode: 429,
				message: 'Resource has been exhausted (e.g. check quota).',
				url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini:streamGenerateContent',
			},
		});
	});

	it('keep only the name of other AI errors, whose message can quote the model', () => {
		const line = logLine(
			new TypeValidationError({ value: { text: secret }, cause: new Error() })
		);
		expect(line).not.toContain(secret);
		expect(JSON.parse(line).err.type).toBe('AI_TypeValidationError');
	});

	it('keep the query and the Postgres code of a failed query, not its values', () => {
		const line = logLine(
			new DrizzleQueryError(
				'insert into "note" ("title", "content") values ($1, $2)',
				['Mitosis', secret],
				postgresError()
			)
		);
		expect(line).not.toContain(secret);
		const { err } = JSON.parse(line);
		expect(err).toMatchObject({
			query: 'insert into "note" ("title", "content") values ($1, $2)',
			cause: { code: '23514', constraint: 'note_content_check', table: 'note' },
		});
		expect(err.stack).toContain('at ');
	});

	it('keep other errors in full', () => {
		const error = Object.assign(new Error('Pool is closed', { cause: 'x' }), {
			code: 'POOL_CLOSED',
		});
		const { err } = JSON.parse(logLine(error));
		expect(err).toMatchObject({
			type: 'Error',
			message: 'Pool is closed',
			code: 'POOL_CLOSED',
			cause: 'x',
		});
		expect(err.stack).toContain('Pool is closed');
	});
});

describe('safeUrl', () => {
	it('drops the query, where the email confirmation token is', () => {
		expect(
			safeUrl('/api/auth/verify-email?token=abc&callbackURL=%2Flogin')
		).toBe('/api/auth/verify-email');
	});

	it('masks the password reset token in the path', () => {
		expect(
			safeUrl('/api/auth/reset-password/abc123?callbackURL=%2Freset-password')
		).toBe('/api/auth/reset-password/[token]');
	});

	it('keeps other urls as they are', () => {
		expect(safeUrl('/api/health')).toBe('/api/health');
		expect(safeUrl('/api/auth/reset-password')).toBe(
			'/api/auth/reset-password'
		);
	});
});
