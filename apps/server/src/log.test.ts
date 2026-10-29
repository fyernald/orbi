import { describe, expect, it } from 'vitest';
import { safeUrl } from './log';

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
