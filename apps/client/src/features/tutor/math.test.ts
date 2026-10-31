import { describe, expect, it } from 'vitest';
import { normalizeMath } from './math';

describe('normalizeMath', () => {
	it('turns single-dollar maths into double', () => {
		expect(normalizeMath('where $n$ is the number of divisions')).toBe(
			'where $$n$$ is the number of divisions'
		);
		expect(normalizeMath('after $n = 3$ divisions, $2^3 = 8$ cells')).toBe(
			'after $$n = 3$$ divisions, $$2^3 = 8$$ cells'
		);
	});

	it('leaves money alone', () => {
		expect(normalizeMath('It costs $5 and $10 on sale.')).toBe(
			'It costs $5 and $10 on sale.'
		);
		expect(normalizeMath('Only $20.')).toBe('Only $20.');
	});

	it('keeps maths that is already double, and escaped dollars', () => {
		expect(normalizeMath('cells: $$2^n$$')).toBe('cells: $$2^n$$');
		expect(normalizeMath('a block:\n$$\nx^2\n$$')).toBe(
			'a block:\n$$\nx^2\n$$'
		);
		expect(normalizeMath('price \\$5 and \\$6')).toBe('price \\$5 and \\$6');
	});

	it('reads \\( \\) and \\[ \\] as maths', () => {
		expect(normalizeMath('so \\(x^2\\) grows')).toBe('so $$x^2$$ grows');
		expect(normalizeMath('Formula:\n\\[ 2^n \\]')).toBe(
			'Formula:\n\n$$\n2^n\n$$\n'
		);
	});

	it('does not touch code', () => {
		expect(normalizeMath('run `echo $HOME$` now')).toBe(
			'run `echo $HOME$` now'
		);
		expect(normalizeMath('```sh\necho $a$\n```\nand $b$')).toBe(
			'```sh\necho $a$\n```\nand $$b$$'
		);
	});

	it('waits for the closing dollar while a reply streams', () => {
		expect(normalizeMath('after $n')).toBe('after $n');
	});
});
