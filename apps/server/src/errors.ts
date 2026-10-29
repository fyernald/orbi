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
