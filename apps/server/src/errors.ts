// Services throw these; the error handler turns them into the status code and
// { error: { code, message } } (app-patterns rule 5). The message is shown to the user.
export class AppError extends Error {
	constructor(
		readonly status: number,
		readonly code: string,
		message: string
	) {
		super(message);
		this.name = new.target.name;
	}
}

export class ValidationError extends AppError {
	constructor(message: string) {
		super(400, 'validation_error', message);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = 'Log in to continue.') {
		super(401, 'unauthorized', message);
	}
}

export class ForbiddenError extends AppError {
	constructor(message = 'You cannot do this.') {
		super(403, 'forbidden', message);
	}
}

// a logged-in student without beta access (US-50); its own code, so the client
// sends them to the key page
export class BetaAccessError extends AppError {
	constructor() {
		super(403, 'beta_access_required', 'Enter a beta key to use Orbi.');
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Not found.') {
		super(404, 'not_found', message);
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super(409, 'conflict', message);
	}
}

export class TooManyRequestsError extends AppError {
	constructor(message: string) {
		super(429, 'too_many_requests', message);
	}
}

// a part of the app that depends on something not set up on this server, like an AI key
export class ServiceUnavailableError extends AppError {
	constructor(message: string) {
		super(503, 'service_unavailable', message);
	}
}
