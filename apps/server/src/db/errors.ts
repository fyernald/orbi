// Postgres error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
const FOREIGN_KEY_VIOLATION = '23503';

export type PostgresError = Error & {
	code: string;
	severity: string;
	constraint?: string;
	table?: string;
	column?: string;
};

// pg and PGlite errors have the same fields; detail can hold the whole row
export const isPostgresError = (error: Error): error is PostgresError =>
	typeof Reflect.get(error, 'code') === 'string' && 'severity' in error;

// the Postgres error itself; Drizzle wraps it in a DrizzleQueryError as its cause
function findPostgresError(error: unknown): PostgresError | undefined {
	for (let current = error; current instanceof Error; current = current.cause) {
		if (isPostgresError(current)) return current;
	}
	return undefined;
}

// a row that points at a row that is not there, for example a note whose topic
// was deleted while it was saved
export function isForeignKeyViolation(error: unknown, constraint: string) {
	const found = findPostgresError(error);
	return (
		found?.code === FOREIGN_KEY_VIOLATION && found.constraint === constraint
	);
}
