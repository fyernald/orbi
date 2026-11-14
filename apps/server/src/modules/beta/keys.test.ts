import { describe, expect, it } from 'vitest';
import { createBetaKey, hashBetaKey, normalizeBetaKey } from './keys';

describe('beta keys', () => {
	it('look like ORBI-XXXX-XXXX-XXXX, without letters that look alike', () => {
		const keys = Array.from({ length: 200 }, createBetaKey);

		for (const key of keys) {
			expect(key).toMatch(
				/^ORBI-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}$/
			);
		}
		expect(new Set(keys).size).toBe(keys.length);
	});

	it('are read the same with or without dashes, spaces, small letters or the prefix', () => {
		const typed = [
			'ORBI-7KQ2-M9XD-R4TW',
			'orbi-7kq2-m9xd-r4tw',
			'ORBI 7KQ2 M9XD R4TW',
			'7KQ2M9XDR4TW',
			' 7kq2-m9xd-r4tw ',
		];

		expect(new Set(typed.map(normalizeBetaKey))).toEqual(
			new Set(['7KQ2M9XDR4TW'])
		);
	});

	it('refuse what cannot be one of our keys', () => {
		expect(normalizeBetaKey('')).toBeNull();
		expect(normalizeBetaKey('ORBI-7KQ2-M9XD')).toBeNull();
		// O and 0 are never used
		expect(normalizeBetaKey('ORBI-7KQ2-M9XD-R4T0')).toBeNull();
		expect(normalizeBetaKey('ABCD-7KQ2-M9XD-R4TW')).toBeNull();
	});

	it('are saved only as a hash', () => {
		const hash = hashBetaKey('7KQ2M9XDR4TW');

		expect(hash).toMatch(/^[0-9a-f]{64}$/);
		expect(hash).not.toContain('7KQ2');
	});
});
