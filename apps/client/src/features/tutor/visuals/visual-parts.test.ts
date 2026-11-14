import { describe, expect, it } from 'vitest';
import type { TutorPart } from '../chat';
import { isHiddenVisualError } from './visual-parts';

const input = {
	title: 'Phases',
	kind: 'flowchart' as const,
	mermaid: 'flowchart TD\n  A --> B',
	description: 'The phases in order.',
};
const failed: TutorPart = {
	type: 'tool-createDiagram',
	toolCallId: 'call-1',
	state: 'output-error',
	input,
	errorText: 'Orbi could not answer. Try again.',
};
const drawn: TutorPart = {
	type: 'tool-createDiagram',
	toolCallId: 'call-2',
	state: 'output-available',
	input,
	output: { shown: true },
};

describe('isHiddenVisualError', () => {
	it('hides a failed visual once the reply shows one that worked', () => {
		expect(isHiddenVisualError([failed, drawn], 0)).toBe(true);
	});

	it('shows the error card when no visual worked', () => {
		expect(
			isHiddenVisualError([failed, { type: 'text', text: 'Sorry.' }], 0)
		).toBe(false);
	});

	it('never hides a visual that worked', () => {
		expect(isHiddenVisualError([failed, drawn], 1)).toBe(false);
	});
});
