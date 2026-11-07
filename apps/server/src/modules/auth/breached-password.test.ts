import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createBreachedPasswordCheck } from './breached-password';

const sha1 = (text: string) =>
	createHash('sha1').update(text).digest('hex').toUpperCase();

describe('createBreachedPasswordCheck', () => {
	it('sends only the first 5 characters of the hash', async () => {
		const asked: string[] = [];
		const check = createBreachedPasswordCheck({
			fetchRange: async (prefix) => {
				asked.push(prefix);
				return '';
			},
			onError: () => {},
		});

		await check('correct-horse-battery');

		expect(asked).toEqual([sha1('correct-horse-battery').slice(0, 5)]);
	});

	it('finds a breached password in the range', async () => {
		const suffix = sha1('password123').slice(5);
		const check = createBreachedPasswordCheck({
			fetchRange: async () =>
				`0000000000000000000000000000000000A:0\r\n${suffix}:251682\r\n`,
			onError: () => {},
		});

		expect(await check('password123')).toBe(true);
		expect(await check('correct-horse-battery')).toBe(false);
	});

	it('does not count a padding line with 0 breaches', async () => {
		const suffix = sha1('password123').slice(5);
		const check = createBreachedPasswordCheck({
			fetchRange: async () => `${suffix}:0`,
			onError: () => {},
		});

		expect(await check('password123')).toBe(false);
	});

	it('lets the password through when the service fails', async () => {
		const errors: unknown[] = [];
		const check = createBreachedPasswordCheck({
			fetchRange: async () => {
				throw new Error('timeout');
			},
			onError: (error) => errors.push(error),
		});

		expect(await check('password123')).toBe(false);
		expect(errors).toHaveLength(1);
	});
});
