import { describe, expect, it } from 'vitest';
import {
	alignNumericColumns,
	isNumeric,
	numericColumns,
} from './numeric-columns';

describe('isNumeric', () => {
	it.each(['12', '-3.5', '1,200', '45%', '$10', '3 kg', ' 7 '])(
		'counts %j as a number',
		(text) => expect(isNumeric(text)).toBe(true)
	);

	it.each(['Mitosis', '2nd', 'G1 phase', '', 'about 5'])(
		'does not count %j',
		(text) => expect(isNumeric(text)).toBe(false)
	);
});

describe('numericColumns', () => {
	it('finds the columns where every filled cell is a number', () => {
		const rows = [
			['Prophase', '20', 'long'],
			['Metaphase', '', 'short'],
			['Anaphase', '5%', '3'],
		];
		expect(numericColumns(rows)).toEqual(new Set([1]));
	});

	it('finds none in an empty table', () => {
		expect(numericColumns([])).toEqual(new Set());
	});
});

const text = (value: string) => ({ type: 'text', value });
const cell = (tagName: string, value: string, align?: string) => ({
	type: 'element',
	tagName,
	properties: align ? { align } : {},
	children: [text(value)],
});
const row = (...cells: ReturnType<typeof cell>[]) => ({
	type: 'element',
	tagName: 'tr',
	properties: {},
	children: cells,
});

describe('alignNumericColumns', () => {
	it('right-aligns the header and cells of a number column', () => {
		const table = {
			type: 'element',
			tagName: 'table',
			children: [
				{
					type: 'element',
					tagName: 'thead',
					children: [row(cell('th', 'Phase'), cell('th', 'Minutes'))],
				},
				{
					type: 'element',
					tagName: 'tbody',
					children: [
						row(cell('td', 'Prophase'), cell('td', '20')),
						row(cell('td', 'Anaphase'), cell('td', '5')),
					],
				},
			],
		};
		const tree = { type: 'root', children: [table] };
		alignNumericColumns()(tree);

		const aligns = [table.children[0]!, table.children[1]!].flatMap((section) =>
			section.children.map((tr) =>
				tr.children.map((c) => c.properties.align ?? null)
			)
		);
		expect(aligns).toEqual([
			[null, 'right'],
			[null, 'right'],
			[null, 'right'],
		]);
	});

	it('keeps an alignment the markdown set', () => {
		const centred = cell('td', '20', 'center');
		const table = {
			type: 'element',
			tagName: 'table',
			children: [
				{ type: 'element', tagName: 'tbody', children: [row(centred)] },
			],
		};
		alignNumericColumns()({ type: 'root', children: [table] });
		expect(centred.properties.align).toBe('center');
	});
});
