import { describe, expect, it } from 'vitest';
import { fileNameFor } from './download';

describe('fileNameFor', () => {
	it('turns a title into a safe file name', () => {
		expect(fileNameFor('Binary search tree (insert 7)', 'svg')).toBe(
			'binary-search-tree-insert-7.svg'
		);
		expect(fileNameFor('Hücre döngüsü', 'png')).toBe('hucre-dongusu.png');
	});

	it('falls back to orbi for a title with nothing to keep', () => {
		expect(fileNameFor('→ ?', 'png')).toBe('orbi.png');
	});
});
