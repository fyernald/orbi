import { DrizzleQueryError } from 'drizzle-orm/errors';
import { describe, expect, it } from 'vitest';
import { isForeignKeyViolation } from './errors';

// the fields pg and PGlite put on an error
const postgresError = (code: string, constraint?: string) =>
	Object.assign(new Error('insert failed'), {
		code,
		severity: 'ERROR',
		constraint,
	});

describe('isForeignKeyViolation', () => {
	it('finds the Postgres error inside the error Drizzle throws', () => {
		const error = new DrizzleQueryError(
			'insert into "note"',
			[],
			postgresError('23503', 'note_topic_fk')
		);

		expect(isForeignKeyViolation(error, 'note_topic_fk')).toBe(true);
	});

	it('takes a Postgres error on its own', () => {
		expect(
			isForeignKeyViolation(
				postgresError('23503', 'note_topic_fk'),
				'note_topic_fk'
			)
		).toBe(true);
	});

	it('is false for another foreign key', () => {
		expect(
			isForeignKeyViolation(
				postgresError('23503', 'chat_topic_fk'),
				'note_topic_fk'
			)
		).toBe(false);
	});

	it('is false for another database error', () => {
		expect(
			isForeignKeyViolation(
				postgresError('23514', 'note_topic_fk'),
				'note_topic_fk'
			)
		).toBe(false);
	});

	it('is false for errors that do not come from Postgres', () => {
		expect(isForeignKeyViolation(new Error('timeout'), 'note_topic_fk')).toBe(
			false
		);
		expect(isForeignKeyViolation('note_topic_fk', 'note_topic_fk')).toBe(false);
	});
});
