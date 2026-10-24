type AuthErrorBody = { code?: string; message?: string; status: number };

type AuthResult<T> =
	{ data: T; error: null } | { data: null; error: AuthErrorBody };

export class AuthError extends Error {
	readonly code?: string;
	readonly status: number;

	constructor({ code, message, status }: AuthErrorBody) {
		super(message ?? 'Request failed');
		this.name = 'AuthError';
		this.code = code;
		this.status = status;
	}
}

// Better Auth answers with { data, error } instead of throwing, which TanStack Query needs
export function unwrap<T>(result: AuthResult<T>): T {
	if (result.error) throw new AuthError(result.error);
	return result.data;
}

const messages: Record<string, string> = {
	INVALID_EMAIL_OR_PASSWORD: 'Wrong email or password.',
	USER_ALREADY_EXISTS: 'An account with this email already exists.',
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
		'An account with this email already exists.',
};

const fallback = 'Something went wrong. Please try again.';

export function authErrorMessage(error: unknown): string | undefined {
	if (!error) return undefined;
	if (!(error instanceof AuthError)) return fallback;
	if (error.status === 429) {
		return 'Too many attempts. Wait a minute and try again.';
	}
	if (error.code === 'VALIDATION_ERROR') return error.message;
	return (error.code && messages[error.code]) || fallback;
}
