import { describe, expect, it } from 'vitest';
import { keyPageCopy } from './key-page-copy';

describe('keyPageCopy', () => {
	it('asks a new student for their key', () => {
		expect(keyPageCopy({ hasAccess: false, endsAt: null }).title).toBe(
			'Enter your beta key'
		);
	});

	it('tells a student whose access ended that their work is kept', () => {
		const copy = keyPageCopy({
			hasAccess: false,
			endsAt: '2026-11-01T10:00:00.000Z',
		});

		expect(copy.title).toBe('Your access has ended');
		expect(copy.description).toContain('still here');
	});
});
