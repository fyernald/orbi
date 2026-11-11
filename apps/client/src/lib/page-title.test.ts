import { describe, expect, it } from 'vitest';
import { pageTitle } from './page-title';

describe('pageTitle', () => {
	it('names the page, then Orbi', () => {
		expect(pageTitle('Biology 101')).toBe('Biology 101 · Orbi');
	});

	it('keeps the name as it is', () => {
		expect(pageTitle('100% exam prep %s')).toBe('100% exam prep %s · Orbi');
		expect(pageTitle('Prices in $& and $1')).toBe('Prices in $& and $1 · Orbi');
	});
});
