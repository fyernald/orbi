import type { FastifyError, FastifyInstance } from 'fastify';
import { hasZodFastifySchemaValidationErrors } from 'fastify-type-provider-zod';
import { AppError } from './errors';

export type ErrorBody = { error: { code: string; message: string } };

const errorBody = (code: string, message: string): ErrorBody => ({
	error: { code, message },
});

// codes for the 4xx errors Fastify throws itself, for example a broken JSON body
const codeByStatus: Record<number, string> = {
	400: 'bad_request',
	401: 'unauthorized',
	404: 'not_found',
	413: 'payload_too_large',
	415: 'unsupported_media_type',
	429: 'too_many_requests',
};

// every route answers errors in the same shape; unknown errors never show their details
export function registerErrorHandler(app: FastifyInstance) {
	app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
		if (error instanceof AppError) {
			return reply
				.status(error.status)
				.send(errorBody(error.code, error.message));
		}

		// a route schema rejected the request; the first Zod message is the one written for users
		if (hasZodFastifySchemaValidationErrors(error)) {
			const message = error.validation[0]?.message ?? error.message;
			return reply.status(400).send(errorBody('validation_error', message));
		}

		if ('validation' in error && error.validation) {
			return reply
				.status(400)
				.send(errorBody('validation_error', error.message));
		}

		const status = ('statusCode' in error && error.statusCode) || 500;
		if (status >= 400 && status < 500) {
			return reply
				.status(status)
				.send(errorBody(codeByStatus[status] ?? 'bad_request', error.message));
		}

		request.log.error(error);
		return reply
			.status(500)
			.send(
				errorBody('internal_error', 'Something went wrong. Please try again.')
			);
	});

	app.setNotFoundHandler((_request, reply) =>
		reply.status(404).send(errorBody('not_found', 'This route does not exist.'))
	);
}
