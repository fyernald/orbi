import { describe, expect, it } from 'vitest';
import { nearestPage, toPages } from './course-pages';

describe('toPages', () => {
	it('splits the items into full pages and a last, shorter one', () => {
		expect(toPages([1, 2, 3, 4, 5, 6, 7, 8], 6)).toEqual([
			[1, 2, 3, 4, 5, 6],
			[7, 8],
		]);
	});

	it('has no pages without items', () => {
		expect(toPages([], 6)).toEqual([]);
	});
});

describe('nearestPage', () => {
	const starts = [0, 800, 1600];

	it.each([
		[0, 0],
		[350, 0],
		[450, 1],
		[1590, 2],
	])('at %s it is page %s', (scrollLeft, page) => {
		expect(nearestPage(starts, scrollLeft)).toBe(page);
	});
});
