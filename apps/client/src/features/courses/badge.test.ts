import { describe, expect, it } from 'vitest';
import { courseShortName } from './badge';

describe('courseShortName', () => {
	it.each([
		['Biology 101', 'Bio'],
		['  calculus II', 'Cal'],
		['CSE301 Software Engineering', 'CSE'],
		['AI', 'AI'],
	])('%s becomes %s', (name, short) => {
		expect(courseShortName(name)).toBe(short);
	});
});
