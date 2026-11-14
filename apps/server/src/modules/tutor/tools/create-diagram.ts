import { createDiagramInput, createDiagramOutput } from '@orbi/shared';
import { tool } from 'ai';
import type { VisualBudget } from './visual-budget';

// The AI writes the diagram as Mermaid source; the browser draws it with Orbi's
// colours. Nothing is saved apart from the reply itself.
export const createDiagramTool = (visuals: VisualBudget) =>
	tool({
		description:
			'Draw a diagram in the chat (Mermaid). Use it when the student asks to draw, show, map or visualize something, or when a structure, process or relation is much easier to see than to read.',
		inputSchema: createDiagramInput,
		outputSchema: createDiagramOutput,
		execute: async () => {
			visuals.take();
			return { shown: true as const };
		},
	});
