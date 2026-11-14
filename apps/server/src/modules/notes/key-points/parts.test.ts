import { describe, expect, it } from 'vitest';
import { joinUpTo, keyPointNotes, modelParts } from './parts';

describe('joinUpTo', () => {
	it('joins pieces in order while they fit', () => {
		expect(joinUpTo(['aaa', 'bbb', 'ccc'], 8)).toEqual(['aaa\n\nbbb', 'ccc']);
	});

	it('cuts a piece longer than the limit at a line break', () => {
		expect(joinUpTo(['aaaa\nbbbb'], 6)).toEqual(['aaaa', 'bbbb']);
	});

	it('leaves out empty pieces', () => {
		expect(joinUpTo(['', '  ', 'a'], 10)).toEqual(['a']);
	});
});

describe('modelParts', () => {
	it('reads the text of every page, in order', () => {
		expect(modelParts(['page 1', 'page 2', 'page 3'], 14)).toEqual([
			'page 1\n\npage 2',
			'page 3',
		]);
	});
});

describe('keyPointNotes', () => {
	it('makes one note named after the file when the key points fit', () => {
		expect(keyPointNotes('Lecture 3.pdf', ['## Cells', '## DNA'])).toEqual([
			{ title: 'Lecture 3 · key points', content: '## Cells\n\n## DNA' },
		]);
	});

	it('goes on in a second note only past the length limit', () => {
		expect(keyPointNotes('cells.pdf', ['## One', '## Two'], 8)).toEqual([
			{ title: 'cells · key points 1 of 2', content: '## One' },
			{ title: 'cells · key points 2 of 2', content: '## Two' },
		]);
	});

	it('makes no note when the model wrote nothing', () => {
		expect(keyPointNotes('cells.pdf', ['', ' '])).toEqual([]);
	});
});
