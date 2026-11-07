import { createDiagramInput, diagramSourceProblem } from '@orbi/shared';
import { describe, expect, it } from 'vitest';
import { createVisualBudget } from './visual-budget';

const tree = {
	title: 'Binary search tree',
	kind: 'tree',
	mermaid: 'flowchart TD\n  8 --> 3\n  8 --> 10',
	description: 'A binary search tree with root 8.',
};

describe('createDiagramInput', () => {
	it('takes a small diagram', () => {
		expect(createDiagramInput.safeParse(tree).success).toBe(true);
	});

	it('reads the diagram type after comment lines', () => {
		expect(
			diagramSourceProblem(
				'mindmap',
				'%% the main ideas\nmindmap\n  root((Cell))'
			)
		).toBeUndefined();
	});

	it('names the problem so the AI can fix it', () => {
		expect(
			diagramSourceProblem('flowchart', '```mermaid\nflowchart TD\n```')
		).toBe('Send the Mermaid source without code fences.');
		expect(
			diagramSourceProblem(
				'flowchart',
				'%%{init: {"theme": "dark"}}%%\nflowchart TD'
			)
		).toContain('Do not set Mermaid config');
		expect(
			diagramSourceProblem('flowchart', '---\nconfig: {}\n---\nflowchart TD')
		).toContain('Do not set Mermaid config');
		expect(diagramSourceProblem('sequence', 'flowchart TD\n  A --> B')).toBe(
			'A sequence diagram must start with sequenceDiagram.'
		);
	});

	it('refuses an empty or too long diagram', () => {
		expect(
			createDiagramInput.safeParse({ ...tree, mermaid: ' ' }).success
		).toBe(false);
		expect(
			createDiagramInput.safeParse({
				...tree,
				mermaid: `flowchart TD\n${'  A --> B\n'.repeat(500)}`,
			}).success
		).toBe(false);
	});
});

describe('createVisualBudget', () => {
	it('lets a reply show two visuals, then tells the AI to stop', () => {
		const budget = createVisualBudget();

		budget.take();
		budget.take();

		expect(() => budget.take()).toThrow('already shows 2 visuals');
	});
});
